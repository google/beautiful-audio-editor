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
goog.provide('audioCat.audio.record.RecordingJob');

goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.audio.junction.DestinationJunction');
goog.require('audioCat.audio.junction.GainJunction');
goog.require('audioCat.audio.junction.MediaSourceJunction');
goog.require('audioCat.audio.junction.ScriptProcessorJunction');
goog.require('audioCat.audio.record.Event');
goog.require('audioCat.audio.record.RecordingAudioChestReadyEvent');
goog.require('audioCat.utility.EventTarget');


/**
 * Does a single of recording of audio from a media source. Must be stopped
 * after starting. Can only start and stop once.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio contexts.
 * @param {!MediaStream} mediaStream Streams audio from some media source.
 * @param {!audioCat.audio.junction.DestinationJunction} destinationJunction The
 *     destination junction for outputting audio.
 * @param {number} numberOfChannels The number of channels.
 * @param {number=} opt_beginTime The time in seconds into the project at which
 *     to place the section to be created from the recording. Defaults to 0.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.record.RecordingJob = function(
    idGenerator,
    audioContextManager,
    mediaStream,
    destinationJunction,
    numberOfChannels,
    opt_beginTime) {
  goog.base(this);
  /**
   * Manages audio contexts.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * An ID unique this recording job.
   * @private {!audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * The stream of media.
   * @private {!MediaStream}
   */
  this.mediaStream_ = mediaStream;

  /**
   * The sample rate of recording. Meaningless if no recording has occurred.
   * @private {number}
   */
  this.sampleRate_ = 0;

  /**
   * The total length of the recording in samples.
   * @private {number}
   */
  this.totalLengthInSamples_ = 0;

  /**
   * Stores buffer data. Each channel has an array of samples.
   * @private {!Array.<!Array.<!Float32Array>>}
   */
  this.bufferData_ = [];

  /**
   * The accumulated recording time so far.
   * @private {number}
   */
  this.timeRecorded_ = 0;

  /**
   * The time into the project (s) at which to place the new section.
   * @private {number}
   */
  this.beginTime_ = opt_beginTime || 0;

  /**
   * The number of channels to record with. Meaningless if no recording has
   * occurred.
   * @private {number}
   */
  this.numberOfChannels_ = numberOfChannels;
  this.setNumberOfChannels_(numberOfChannels);

  /**
   * The media source junction.
   * @private {!audioCat.audio.junction.MediaSourceJunction}
   */
  this.mediaSourceJunction_ = new audioCat.audio.junction.MediaSourceJunction(
      idGenerator, audioContextManager, mediaStream);

  /**
   * The script processor junction used to obtain real-time audio data.
   * @private {!audioCat.audio.junction.ScriptProcessorJunction}
   */
  this.scriptProcessorJunction_ =
      new audioCat.audio.junction.ScriptProcessorJunction(
          idGenerator, audioContextManager, numberOfChannels,
          goog.bind(this.handleAudioProcess_, this));

  /**
   * The gain junction used to silence the audio so the audio isn't passed back
   * into the recording device in case the user lacks headphones.
   * @private {!audioCat.audio.junction.GainJunction}
   */
  this.gainJunction_ = new audioCat.audio.junction.GainJunction(
      idGenerator, audioContextManager, 0);

  /**
   * The destination junction.
   * @private {!audioCat.audio.junction.DestinationJunction}
   */
  this.destinationJunction_ = destinationJunction;
  this.gainJunction_.connect(destinationJunction);
};
goog.inherits(audioCat.audio.record.RecordingJob, audioCat.utility.EventTarget);

/**
 * Starts recording. Can only be called once per recording job.
 */
audioCat.audio.record.RecordingJob.prototype.start =
    function() {
  var mediaSourceJunction = this.mediaSourceJunction_;
  var scriptProcessorJunction = this.scriptProcessorJunction_;
  mediaSourceJunction.connect(scriptProcessorJunction);
  scriptProcessorJunction.connect(this.gainJunction_);

  // The start time is irrelevant here since we're streaming data.
  this.startTime_ = this.audioContextManager_.getAbsoluteTime();
  mediaSourceJunction.start(0);
  this.dispatchEvent(audioCat.audio.record.Event.DEFAULT_RECORDING_STARTED);
};

/**
 * Stops recording. Returns an audio chest from the recording.
 * @return {!audioCat.audio.AudioChest} The chest of audio from the recording.
 */
audioCat.audio.record.RecordingJob.prototype.stop =
    function() {
  this.scriptProcessorJunction_.cleanUp(); // This disconnects.
  this.mediaSourceJunction_.stop();
  this.dispatchEvent(audioCat.audio.record.Event.DEFAULT_RECORDING_STOPPED);

  // Create a new audio buffer.
  var numberOfChannels = this.numberOfChannels_;
  var newAudioBuffer = this.audioContextManager_.createEmptyAudioBuffer(
      numberOfChannels, this.totalLengthInSamples_, this.sampleRate_);

  // Piece together the lists into that single audio buffer.
  var bufferData = this.bufferData_;
  for (var i = 0; i < numberOfChannels; ++i) {
    var pieceMealData = bufferData[i];
    var channel = newAudioBuffer.getChannelData(i);
    var currentNewChannelSampleIndex = 0;
    var pieceMealDataItemLength = pieceMealData.length;
    for (var j = 0; j < pieceMealDataItemLength; ++j) {
      var audioPiece = pieceMealData[j];
      channel.set(audioPiece, currentNewChannelSampleIndex);
      currentNewChannelSampleIndex += audioPiece.length;
    }
  }
  var audioChest = new audioCat.audio.AudioChest(
      newAudioBuffer,
      'New recording.',
      audioCat.audio.AudioOrigination.RECORDED,
      this.idGenerator_);
  this.dispatchEvent(new audioCat.audio.record.RecordingAudioChestReadyEvent(
      audioChest, this.beginTime_));
  return audioChest;
};

/**
 * Handles what happens when audio is processed by the script processor.
 * @param {!AudioProcessingEvent} event The audio processing event as described
 *     by the W3C web audio API standard.
 * @private
 */
audioCat.audio.record.RecordingJob.prototype.handleAudioProcess_ =
    function(event) {
  var inputBuffer = event.inputBuffer;
  var outputBuffer = event.outputBuffer;
  this.sampleRate_ = outputBuffer.sampleRate;
  this.totalLengthInSamples_ += outputBuffer.length;
  var numberOfChannels = this.numberOfChannels_;
  for (var i = 0; i < numberOfChannels; ++i) {
    var inputChannelData = inputBuffer.getChannelData(i);
    var outputChannelData = outputBuffer.getChannelData(i);
    outputChannelData.set(inputChannelData, 0);
    this.bufferData_[i].push(new Float32Array(outputChannelData));
  }

  this.timeRecorded_ += inputBuffer.duration;
  this.dispatchEvent(audioCat.audio.record.Event.MEDIA_STREAMED);
};

/**
 * Sets the number of channels to be used for recording.
 * @param {number} numberOfChannels The number of channels to use.
 * @private
 */
audioCat.audio.record.RecordingJob.prototype.setNumberOfChannels_ =
    function(numberOfChannels) {
  this.numberOfChannels_ = numberOfChannels;
  var bufferData = this.bufferData_;
  bufferData.length = 0;
  for (var i = 0; i < numberOfChannels; ++i) {
    // Each channel gets a list of audio data.
    bufferData.push([]);
  }
};

/**
 * @return {number} The seconds into the recording job. Assumes that recording
 *     has already started. Otherwise, silently returns a wrong value.
 */
audioCat.audio.record.RecordingJob.prototype.computeTimeIntoRecording =
    function() {
  return this.timeRecorded_;
};
