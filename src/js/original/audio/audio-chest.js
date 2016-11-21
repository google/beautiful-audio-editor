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
goog.provide('audioCat.audio.AudioChest');


/**
 * Stores a selection of audio. This audio could have been imported for
 * instance.
 * @param {!AudioBuffer} audioBuffer The audio buffer representing the audio.
 * @param {string} audioName The name of the audio selection.
 * @param {audioCat.audio.AudioOrigination} audioOrigination Denotes where the
 *     audio came from.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {audioCat.utility.Id=} opt_overridingId An ID to assign this Audio
 *     Chest. If provided, the audio chest will use this ID instead of creating
 *     a new one.
 * @constructor
 */
audioCat.audio.AudioChest = function(
    audioBuffer,
    audioName,
    audioOrigination,
    idGenerator,
    opt_overridingId) {
  /**
   * An ID unique to this audio chest.
   * @private {number}
   */
  this.id_ = opt_overridingId || idGenerator.obtainUniqueId();

  /**
   * The audio buffer representing the audio.
   * @private {!AudioBuffer}
   */
  this.audioBuffer_ = audioBuffer;

  /**
   * The name of the audio selection.
   * @private {string}
   */
  this.audioName_ = audioName;

  /**
   * Where the audio came from.
   * @private {audioCat.audio.AudioOrigination}
   */
  this.audioOrigination_ = audioOrigination;
};

/**
 * @return {audioCat.utility.Id} An ID unique to this audio chest.
 */
audioCat.audio.AudioChest.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {number} The number of channels the audio has.
 */
audioCat.audio.AudioChest.prototype.getNumberOfChannels = function() {
  return this.audioBuffer_.numberOfChannels;
};

/**
 * @return {number} The duration of the audio in seconds.
 */
audioCat.audio.AudioChest.prototype.getDuration = function() {
  return this.audioBuffer_.duration;
};

/**
 * @return {number} The sample rate of the audio (samples / s).
 */
audioCat.audio.AudioChest.prototype.getSampleRate = function() {
  return this.audioBuffer_.sampleRate;
};

/**
 * @return {number} The length of the audio.
 */
audioCat.audio.AudioChest.prototype.getNumberOfSamples = function() {
  return this.audioBuffer_.length;
};

/**
 * @return {string} The name of the audio.
 */
audioCat.audio.AudioChest.prototype.getAudioName = function() {
  return this.audioName_;
};

/**
 * @return {audioCat.audio.AudioOrigination} Where the audio came from.
 */
audioCat.audio.AudioChest.prototype.getAudioOrigination = function() {
  return this.audioOrigination_;
};

/**
 * Obtains the ith channel.
 * @param {number} i The index of the channel.
 * @return {?Float32Array} The channel data. Apparently ... according to w3c
 *     specs, this could be null.
 */
audioCat.audio.AudioChest.prototype.getIthChannel = function(i) {
  return this.audioBuffer_.getChannelData(i);
};

/**
 * Obtains the sample value at an index into the audio buffer.
 * @param {number} channelIndex The channel from which to obtain the sample.
 * @param {number} sampleIndex The index to obtain the sample for.
 * @return {number} The sample within [-1.0, 1.0] at a certain index in the
 *     audio chest.
 */
audioCat.audio.AudioChest.prototype.getSampleAtIndex =
    function(channelIndex, sampleIndex) {
  var channelData = this.audioBuffer_.getChannelData(channelIndex);
  return channelData[sampleIndex];
};

/**
 * Sets the buffer for an audio source node to be that of the audio in this
 * chest.
 * @param {!AudioBufferSourceNode} sourceNode The audio buffer source node to
 *     set the buffer for.
 */
audioCat.audio.AudioChest.prototype.setForSourceNode = function(sourceNode) {
  sourceNode.buffer = this.audioBuffer_;
};

/**
 * @return {!AudioBuffer} The audio buffer storing audio for both channels.
 */
audioCat.audio.AudioChest.prototype.getAudioBuffer = function() {
  return this.audioBuffer_;
};

/**
 * @return {number} The totol number of bytes that the audio chest takes up.
 */
audioCat.audio.AudioChest.prototype.obtainTotalByteSize = function() {
  var totalMemory = 0;
  var numberOfChannels = this.getNumberOfChannels();
  for (var i = 0; i < numberOfChannels; ++i) {
    totalMemory += this.audioBuffer_.getChannelData(i).byteLength;
  }
  return totalMemory;
};
