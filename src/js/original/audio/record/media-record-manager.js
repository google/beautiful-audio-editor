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
goog.provide('audioCat.audio.record.MediaRecordManager');

goog.require('audioCat.audio.record.Event');
goog.require('audioCat.audio.record.RecordingJob');
goog.require('audioCat.audio.record.RecordingJobCreatedEvent');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.events');


/**
 * Manages the recording of media. Starts recording jobs, which represent single
 * recording operations.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio contexts.
 * @param {!audioCat.audio.record.MediaSourceObtainer} mediaSourceObtainer
 *     Obtains media sources used for recording.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.TrackManager} trackManager Manages the tracks for the
 *     project.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.record.MediaRecordManager = function(
    audioContextManager,
    mediaSourceObtainer,
    idGenerator,
    trackManager,
    supportDetector) {
  goog.base(this);

  /**
   * Manages audio contexts.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * Obtains media sources used for recording.
   * @private {!audioCat.audio.record.MediaSourceObtainer}
   */
  this.mediaSourceObtainer_ = mediaSourceObtainer;

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * The destination node for recording.
   * @private {!audioCat.audio.junction.DestinationJunction}
   */
  this.destinationJunction_ = new audioCat.audio.junction.DestinationJunction(
      idGenerator, audioContextManager);

  /**
   * Whether this manager is ready for recording from the default audio device.
   * @private {boolean}
   */
  this.readyForDefaultRecording_ = false;

  // Only record if the browser supports it.
  if (supportDetector.getRecordingSupported()) {
    // Fires an event when default recording ready.
    goog.events.listen(mediaSourceObtainer,
        audioCat.audio.record.Event.DEFAULT_AUDIO_STREAM_OBTAINED,
        this.handleDefaultRecordingReady_, false, this);

    mediaSourceObtainer.obtainDefaultAudioStream();
  }
};
goog.inherits(
    audioCat.audio.record.MediaRecordManager, audioCat.utility.EventTarget);

/**
 * Handles what happens when default recording is ready.
 * @private
 */
audioCat.audio.record.MediaRecordManager.prototype.
    handleDefaultRecordingReady_ = function() {
  this.readyForDefaultRecording_ = true;
  this.dispatchEvent(audioCat.audio.record.Event.READY_FOR_DEFAULT_RECORDING);
};

/**
 * Creates a new job for recording that uses the default audio source. Must be
 * called after recording through the default device is ready.
 * @param {number} numberOfChannels The number of channels to record with.
 * @param {number=} opt_beginTime The time in seconds into the project at which
 *     to place the section to be created from the recording. Defaults to 0.
 * @return {!audioCat.audio.record.RecordingJob} The newly created job
 *     recording.
 */
audioCat.audio.record.MediaRecordManager.prototype.createDefaultRecordingJob =
    function(numberOfChannels, opt_beginTime) {
  if (!this.readyForDefaultRecording_) {
    throw 1; // Job recording created while not ready yet.
  }

  var recordingJob = new audioCat.audio.record.RecordingJob(
      this.idGenerator_, this.audioContextManager_,
      /** @type {!MediaStream} */ (
          this.mediaSourceObtainer_.getDefaultAudioStream()),
      this.destinationJunction_, numberOfChannels, opt_beginTime);
  this.dispatchEvent(new audioCat.audio.record.RecordingJobCreatedEvent(
      recordingJob));
  return recordingJob;
};

/**
 * @return {boolean} Whether default recording is ready.
 */
audioCat.audio.record.MediaRecordManager.prototype.
    getDefaultRecordingReadyState = function() {
  return this.readyForDefaultRecording_;
};
