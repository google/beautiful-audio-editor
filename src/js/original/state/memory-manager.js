/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audioCat.state.MemoryManager');

goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.state.Clip');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');



/**
 * Manages the memory of the application. So far, primarily only tracks the
 * memory taken up by audio data.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interfaces
 *     with the web audio API.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.MemoryManager = function(
    idGenerator, audioContextManager, trackManager) {
  audioCat.state.MemoryManager.base(this, 'constructor');
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  // TODO(chizeng): Use track manager to figure out how many bytes we'd shave.
  /**
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * The memory used so far in bytes.
   * @private {number}
   */
  this.bytesUsed_ = 0;
};
goog.inherits(audioCat.state.MemoryManager, audioCat.utility.EventTarget);


// isEnding is 0 if point is starting, 1 if point is ending.
/**
 * @typedef {{
 *   sampleIndex: number,
 *   isEnding: number,
 *   section: !audioCat.state.Section
 * }}
 */
audioCat.state.MemoryManager.SamplePosition_;


/**
 * Sets how many bytes are used collectively. This overrides the previous value.
 * @param {number} bytesUsed
 */
audioCat.state.MemoryManager.prototype.setBytesUsed = function(bytesUsed) {
  if (this.bytesUsed_ != bytesUsed) {
    this.bytesUsed_ = bytesUsed;
    this.dispatchEvent(audioCat.state.events.MEMORY_CHANGED);
  }
};


/**
 * @return {number} How many bytes are used in total for audio data throughout
 *     the application.
 */
audioCat.state.MemoryManager.prototype.getBytesUsed = function() {
  return this.bytesUsed_;
};


/**
 * Notes that we have used this many additional bytes on top of what we have
 * used already.
 * @param {number} bytesAdded
 */
audioCat.state.MemoryManager.prototype.addBytes = function(bytesAdded) {
  if (bytesAdded) {
    this.bytesUsed_ += bytesAdded;
    this.dispatchEvent(audioCat.state.events.MEMORY_CHANGED);
  }
};


/**
 * Notes that we have removed this many bytes from application memory.
 * @param {number} bytesSubtracted
 */
audioCat.state.MemoryManager.prototype.subtractBytes =
    function(bytesSubtracted) {
  if (bytesSubtracted) {
    this.bytesUsed_ -= bytesSubtracted;
    this.dispatchEvent(audioCat.state.events.MEMORY_CHANGED);
  }
};


/**
 * Computes the minimum amount of audio memory needed to represent the current
 * state of the application. This means removing all command history.
 * @return {number} The min number of bytes needed to represent the current
 *     state.
 */
audioCat.state.MemoryManager.prototype.obtainMinShavedSize = function() {
  var shavedMemory = 0;
  var chestIdToPositionListMapping = {};
  var numberOfTracks = this.trackManager_.getNumberOfTracks();
  for (var t = 0; t < numberOfTracks; ++t) {
    var track = this.trackManager_.getTrack(t);
    for (var s = 0; s < track.getNumberOfSections(); ++s) {
      var currentSection = track.getSectionAtIndexFromBeginning(s);
      var beginSample = currentSection.getBeginAudioChestSampleIndex();
      var endSample = currentSection.getAudioChestSampleRightBound();
      if (endSample > beginSample) {
        // Consider this sample!
        var audioChest = currentSection.getAudioChest();
        if (!chestIdToPositionListMapping[audioChest.getId()]) {
          chestIdToPositionListMapping[audioChest.getId()] = [];
        }
        chestIdToPositionListMapping[audioChest.getId()].push(
          {
              sampleIndex: beginSample,
              isEnding: 0,
              section: currentSection
          }, {
              sampleIndex: endSample,
              isEnding: 1,
              section: currentSection
          });
      }
    }
  }
  // Now, we determine the lengths.
  for (var chestId in chestIdToPositionListMapping) {
    var pointList = chestIdToPositionListMapping[chestId];
    pointList.sort(function(point0, point1) {
      // Sort by sample index except ... see below.
      if (point0.sampleIndex < point1.sampleIndex) {
        return -1;
      } else if (point0.sampleIndex > point1.sampleIndex) {
        return 1;
      } else {
        // Have starting points come first.
        return point0.isEnding - point1.isEnding;
      }
    });
    // Every time the counter hits 0, we've started a new chunk!
    var openingStatus = 0;
    var previousChunkBegin = -1;
    var sampleCountNeeded = 0;
    for (var p = 0; p < pointList.length; ++p) {
      var point = pointList[p];
      if (point.isEnding) {
        openingStatus--;
        if (openingStatus == 0) {
          // We've made a chunk!
          sampleCountNeeded += point.sampleIndex - previousChunkBegin;
          // Mark as -1 to indicate we need a new one.
          previousChunkBegin = -1;
        }
      } else {
        openingStatus++;
        if (previousChunkBegin == -1) {
          // -1 is the sentinel value indicating we need a new beginning sample.
          previousChunkBegin = point.sampleIndex;
        }
      }
    }

    // We need this fraction of all the data.
    var audioChest = pointList[0].section.getAudioChest();
    shavedMemory += (sampleCountNeeded /
        audioChest.getNumberOfSamples() * audioChest.obtainTotalByteSize());
  }

  return shavedMemory;
};


/**
 * Shaves the application state to its bare minimum representation. Note: This
 * might mess up undo / redo, so obliterate command history before calling this
 * method!
 */
audioCat.state.MemoryManager.prototype.shaveApplicationState = function() {
  var shavedMemory = 0;
  var chestIdToPositionListMapping = {};
  var numberOfTracks = this.trackManager_.getNumberOfTracks();
  for (var t = 0; t < numberOfTracks; ++t) {
    var track = this.trackManager_.getTrack(t);
    for (var s = 0; s < track.getNumberOfSections(); ++s) {
      var currentSection = track.getSectionAtIndexFromBeginning(s);
      var beginSample = currentSection.getBeginAudioChestSampleIndex();
      var endSample = currentSection.getAudioChestSampleRightBound();
      if (endSample > beginSample) {
        // Consider this sample!
        var audioChest = currentSection.getAudioChest();
        if (!chestIdToPositionListMapping[audioChest.getId()]) {
          chestIdToPositionListMapping[audioChest.getId()] = [];
        }
        chestIdToPositionListMapping[audioChest.getId()].push(
          {
              sampleIndex: beginSample,
              isEnding: 0,
              section: currentSection
          }, {
              sampleIndex: endSample,
              isEnding: 1,
              section: currentSection
          });
      }
    }
  }
  // Now, we determine the lengths.
  for (var chestId in chestIdToPositionListMapping) {
    var pointList = chestIdToPositionListMapping[chestId];
    pointList.sort(function(point0, point1) {
      // Sort by sample index except ... see below.
      if (point0.sampleIndex < point1.sampleIndex) {
        return -1;
      } else if (point0.sampleIndex > point1.sampleIndex) {
        return 1;
      } else {
        // Have starting points come first.
        return point0.isEnding - point1.isEnding;
      }
    });
    // The original audio chest took up this many samples and this much memory.
    var currentAudioChest = pointList[0].section.getAudioChest();
    var originalSampleCount = currentAudioChest.getNumberOfSamples();
    var originalByteSize = currentAudioChest.obtainTotalByteSize();
    // Every time the counter hits 0, we've started a new chunk!
    var openingStatus = 0;
    var previousChunkBegin = -1;
    var sampleCountNeeded = 0;
    var sectionsForLastChunk = {}; // Mapping from section ID to section.
    for (var p = 0; p < pointList.length; ++p) {
      var point = pointList[p];
      // Remember this section.
      sectionsForLastChunk[point.section.getId()] = point.section;
      if (point.isEnding) {
        openingStatus--;
        if (openingStatus == 0) {
          // Create new audio chest, subtract from all previous clips.
          var newSampleLength = point.sampleIndex - previousChunkBegin;
          sampleCountNeeded += newSampleLength;
          var numberOfChannels = currentAudioChest.getNumberOfChannels();
          var newAudioBuffer = this.audioContextManager_.createEmptyAudioBuffer(
              numberOfChannels,
              newSampleLength,
              currentAudioChest.getSampleRate());
          // Copy over data.
          for (var c = 0; c < numberOfChannels; ++c) {
            // Copy the data over to the new buffer. ...
            var newData = currentAudioChest.getIthChannel(c).subarray(
                previousChunkBegin, point.sampleIndex);
            this.audioContextManager_.copyChannelToAudioBuffer(
                newAudioBuffer, newData, c);
          }
          var newAudioChest = new audioCat.audio.AudioChest(
              newAudioBuffer,
              currentAudioChest.getAudioName(),
              currentAudioChest.getAudioOrigination(),
              this.idGenerator_);
          for (var sectionId in sectionsForLastChunk) {
            var section = sectionsForLastChunk[sectionId];
            // Set the new audio chest.
            section.setAudioChest(newAudioChest);
            // Alter the clip endings.
            var clipCount = section.getNumberOfClips();
            var newClips = [];
            for (var c = 0; c < clipCount; ++c) {
              var currentClip = section.getClipAtIndex(c);
              newClips.push(new audioCat.state.Clip(
                  this.idGenerator_,
                  currentClip.getBeginSampleIndex() - previousChunkBegin,
                  currentClip.getRightSampleBound() - previousChunkBegin
                ));
            }
            // Destructively remove all clips.
            section.removeAllClips();
            // Add in the new clips, but fire no event.
            for (var c = 0; c < newClips.length; ++c) {
              section.addClip(newClips[c]);
            }
          }
          sectionsForLastChunk = {};
          // Mark as -1 to indicate we need a new one.
          previousChunkBegin = -1;
        }
      } else {
        openingStatus++;
        if (previousChunkBegin == -1) {
          // -1 is the sentinel value indicating we need a new beginning sample.
          // This point is for a beginning one.
          previousChunkBegin = point.sampleIndex;
        }
      }
    }

    shavedMemory +=
        sampleCountNeeded / originalSampleCount * originalByteSize;
  }

  this.setBytesUsed(shavedMemory);
};


/**
 * Notifies other objects that the amount of memory needed to represent the
 * current state of the project has changed.
 */
audioCat.state.MemoryManager.prototype.noteMemoryNeededChange = function() {
  this.dispatchEvent(audioCat.state.events.MEMORY_CHANGED);
};
