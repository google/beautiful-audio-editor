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
goog.provide('audioCat.audio.junction.SectionJunction');

goog.require('audioCat.audio.junction.ClipJunction');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.state.events');
goog.require('goog.events');
goog.require('goog.object');


/**
 * A junction of audio containing a section. Contains clips within to play.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio contexts, both online and offline.
 * @param {!audioCat.state.Section} section The section for this junction.
 * @constructor
 * @implements {audioCat.audio.junction.StartJunction}
 * @extends {audioCat.audio.junction.Junction}
 */
audioCat.audio.junction.SectionJunction =
    function(idGenerator, audioContextManager, section) {
  goog.base(
    this,
    audioContextManager,
    idGenerator,
    audioCat.audio.junction.Type.SECTION);

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Section of audio for this junction.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * If currently playing on a live (non-offline) context, this value stores
   * the previous time into the audio that playing had started on. If currently
   * not playing, -1.
   * @private {number}
   */
  this.previousStartTime_ = -1;

  /**
   * The absolute time at which this section previously started via a
   * non-offline context.
   * @private {number}
   */
  this.previousStartAbsoluteTime_ = 0;

  /**
   * Junctions for the clips in this section. Mapping between clip ID and
   * junction.
   * @private {!Object<
   *    audioCat.utility.Id, !audioCat.audio.junction.ClipJunction>}
   */
  this.clipJunctions_ = {};

  // Add junctions for existing clips.
  var numberOfClips = section.getNumberOfClips();
  var accumulatedFrames = 0;
  var sampleRate = section.getAudioChest().getSampleRate();
  for (var i = 0; i < numberOfClips; ++i) {
    var clip = section.getClipAtIndex(i);
    this.addClipJunction_(clip, accumulatedFrames / sampleRate);
    accumulatedFrames +=
        clip.getRightSampleBound() - clip.getBeginSampleIndex();
  }

  // When clips are added, add a clip junction.
  goog.events.listen(section, audioCat.state.events.CLIP_ADDED,
      this.handleClipAdded_, false, this);

  // When the begin time or playback rate changes,
  // restart playing at the right time.
  goog.events.listen(section,
      audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleBeginTimeChanged_, false, this);
  goog.events.listen(section,
      audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);
  goog.events.listen(section,
      audioCat.state.events.CLIPS_REMOVED,
      this.handleClipsRemoved_, false, this);
};
goog.inherits(audioCat.audio.junction.SectionJunction,
    audioCat.audio.junction.Junction);

/**
 * @override
 * @suppress {checkTypes}
 */
audioCat.audio.junction.SectionJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }
  var section = this.section_;
  goog.events.unlisten(section, audioCat.state.events.CLIPS_REMOVED,
      this.handleClipsRemoved_, false, this);
  goog.events.unlisten(section, audioCat.state.events.CLIP_ADDED,
      this.handleClipAdded_, false, this);
  goog.events.unlisten(section,
      audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleBeginTimeChanged_, false, this);
  goog.events.unlisten(section,
      audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);

  // Clean up all the clips.
  this.cleanUpClips_();
  this.cleanedUp = true;
};

/**
 * Handles what happens when all clips are removed from the section.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.handleClipsRemoved_ =
    function() {
  this.cleanUpClips_();
};

/**
 * Cleans up the junctions for all clips.
 * @private
 * @suppress {checkTypes} because Closure requires a number not a string. :(
 */
audioCat.audio.junction.SectionJunction.prototype.cleanUpClips_ = function() {
  for (var clipId in this.clipJunctions_) {
    this.removeJunctionForClip_(clipId);
  }
};

/**
 * Handles what happens when the begin time changes.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.handleBeginTimeChanged_ =
    function() {
  this.restartSectionAtRightTime_();
};

/**
 * Handles what happens when the begin time changes.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.handlePlaybackRateChanged_ =
    function() {
  this.restartSectionAtRightTime_();
};

/**
 * Stop playing audio, and restart at the right time if we had been playing in
 * the first place.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.restartSectionAtRightTime_ =
    function() {
  // If we're not even playing, we do nothing since what's playing is working
  // just fine.
  if (this.previousStartTime_ == -1) {
    return;
  }
  var previousStartTime = this.previousStartTime_;
  this.stop();
  this.start(previousStartTime + this.audioContextManager.getAbsoluteTime() -
      this.previousStartAbsoluteTime_);
};

/**
 * Handles what happens when a clip is added to the section.
 * @param {!audioCat.state.ClipAddedEvent} event The associated event.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.handleClipAdded_ =
    function(event) {
  this.addClipJunction_(event.getClip(), event.getBeginTime());
};

/**
 * Creates a new junction for a clip, and adds it to this section junction.
 * @param {!audioCat.state.Clip} clip The clip to add a junction for.
 * @param {number} beginTime The begin time in seconds of the clip relative to
 *     the beginning of the section.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.addClipJunction_ =
    function(clip, beginTime) {
  // TODO(chizeng): Remove the un-needed audio chest argument.
  var clipJunction = new audioCat.audio.junction.ClipJunction(
      this.idGenerator_, this.audioContextManager, this.section_,
      this.section_.getAudioChest(), clip, beginTime);
  var nextJunction = this.nextJunction;
  if (nextJunction) {
    clipJunction.connect(
        /** @type {!audioCat.audio.junction.SubsequentJunction} */ (
            nextJunction));
  }
  this.clipJunctions_[clip.getId()] = clipJunction;
};

/**
 * Removes a junction for a clip.
 * @param {audioCat.utility.Id} clipId The ID of the clip for which to remove
 *     the junction. This function assumes that a clip with this ID exists for
 *     the section.
 * @private
 */
audioCat.audio.junction.SectionJunction.prototype.removeJunctionForClip_ =
    function(clipId) {
  this.clipJunctions_[clipId].stop();
  this.clipJunctions_[clipId].cleanUp();
  delete this.clipJunctions_[clipId];
};

/** @override */
audioCat.audio.junction.SectionJunction.prototype.start =
    function(time, opt_offlineAudioContext) {
  var section = this.section_;
  var sectionBeginTime = section.getBeginTime();
  var sectionEndTime = sectionBeginTime + section.getDuration();

  if (!opt_offlineAudioContext) {
    this.previousStartTime_ = time;
    this.previousStartAbsoluteTime_ =
        this.audioContextManager.getAbsoluteTime();
  }

  if (time >= sectionEndTime) {
    // Playing's after this section's ended. Don't play this section.
    return;
  }

  goog.object.forEach(this.clipJunctions_, function(clipJunction) {
    clipJunction.start(time, opt_offlineAudioContext);
  }, this);
};

/** @override */
audioCat.audio.junction.SectionJunction.prototype.stop = function() {
  goog.object.forEach(this.clipJunctions_, function(clipJunction) {
    clipJunction.stop();
  }, this);
  this.previousStartTime_ = -1;
};

/** @override */
audioCat.audio.junction.SectionJunction.prototype.connect = function(junction) {
  goog.object.forEach(this.clipJunctions_, function(clipJunction) {
    clipJunction.connect(junction);
  }, this);
  junction.addPreviousJunction(this);
};
