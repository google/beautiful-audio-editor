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
goog.provide('audioCat.audio.render.AudioRenderer');

goog.require('audioCat.audio.render.AudioRenderedEvent');
goog.require('audioCat.audio.render.ExceptionType');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.events');


/**
 * Renders audio into an audio buffer. Fires an event when done rendering.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages both
 *     offline and online contexts.
 * @param {!audioCat.audio.AudioGraph} audioGraph The graph of the audio.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.render.AudioRenderer = function(
    audioContextManager,
    audioGraph,
    trackManager,
    idGenerator) {
  goog.base(this);

  /**
   * Manages audio contexts.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * Manages the graph of the audio.
   * @private {!audioCat.audio.AudioGraph}
   */
  this.audioGraph_ = audioGraph;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The ID for the next rendering operation. Every time we render, we update
   * the ID for the next rendering operation.
   * @private {!audioCat.utility.Id}
   */
  this.nextRenderId_ = idGenerator.obtainUniqueId();
};
goog.inherits(
    audioCat.audio.render.AudioRenderer, audioCat.utility.EventTarget);

/**
 * Renders audio in the graph and fires an event containing the resulting
 * AudioBuffer when done. Throws exceptions if the rendering is unsuccessful.
 */
audioCat.audio.render.AudioRenderer.prototype.renderAudioGraph = function() {
  // Find out the duration of the completed audio.
  var currentRenderId = this.nextRenderId_;
  this.nextRenderId_ = this.idGenerator_.obtainUniqueId();

  var trackManager = this.trackManager_;
  var latestEndTimeInSeconds = 0;

  // Only consider the solo-ed track.
  var soloedTrack = trackManager.getSoloedTrack();

  var numberOfTracks = trackManager.getNumberOfTracks();
  if (soloedTrack) {
    var numberOfSections = soloedTrack.getNumberOfSections();
    for (var j = 0; j < numberOfSections; ++j) {
      var section = soloedTrack.getSectionAtIndexFromBeginning(j);
      var newTime = section.getBeginTime() + section.getDuration();
      if (newTime > latestEndTimeInSeconds) {
        latestEndTimeInSeconds = newTime;
      }
    }
  } else {
    for (var i = 0; i < numberOfTracks; ++i) {
      var track = trackManager.getTrack(i);
      if (track.getMutedState()) {
        // Discount muted tracks.
        continue;
      }
      var numberOfSections = track.getNumberOfSections();
      for (var j = 0; j < numberOfSections; ++j) {
        var section = track.getSectionAtIndexFromBeginning(j);
        var newTime = section.getBeginTime() + section.getDuration();
        if (newTime > latestEndTimeInSeconds) {
          latestEndTimeInSeconds = newTime;
        }
      }
    }
  }

  var audioContextManager = this.audioContextManager_;

  // Compute number of samples needed assuming default sample rate.
  var sampleRate = audioContextManager.getSampleRate();
  var numberOfChannels = 2;
  var lengthInSamples = Math.ceil(latestEndTimeInSeconds * sampleRate);

  // No audio is available, so throw the right exception, and end this function.
  if (lengthInSamples == 0) {
    switch (numberOfTracks) {
      case 0:
        throw audioCat.audio.render.ExceptionType.NO_TRACKS_TO_RENDER;
      case 1:
        throw audioCat.audio.render.ExceptionType.TRACK_SILENT;
    }
    throw audioCat.audio.render.ExceptionType.TRACKS_SILENT;
  }

  // Create offline context.
  var offlineContext = audioContextManager.createOfflineAudioContext(
      numberOfChannels, lengthInSamples, sampleRate);

  // Tell audio graph to prepare for offline rendering.
  this.audioGraph_.startForOfflineRendering(offlineContext);

  // When offline rendering complete, dispatch event.
  offlineContext.oncomplete = goog.bind(
      this.handleOfflineContextRenderingComplete_, this, currentRenderId);

  // Begin rendering.
  offlineContext.startRendering();
};

/**
 * Handles what happens when the offline audio context finishes rendering.
 * @param {!audioCat.utility.Id} renderId The ID of this rendering operation.
 *     Each rendering operation has its own ID.
 * @param {OfflineAudioCompletionEvent} event The associated event. Or none if
 *     there is an error.
 * @private
 */
audioCat.audio.render.AudioRenderer.prototype.
    handleOfflineContextRenderingComplete_ = function(renderId, event) {
  if (!event) {
    throw 3; // TODO(chizeng): Deal with non-existent event.
  }
  var audioBuffer = event.renderedBuffer;
  if (!audioBuffer) {
    throw 3; // TODO(chizeng): Deal with non-existent audio buffer.
  }
  this.dispatchEvent(
      new audioCat.audio.render.AudioRenderedEvent(renderId, audioBuffer));
};

/**
 * @return {!audioCat.utility.Id} The rendering ID for the next rendering
 *     operation to be started.
 */
audioCat.audio.render.AudioRenderer.prototype.getNextRenderId = function() {
  return this.nextRenderId_;
};
