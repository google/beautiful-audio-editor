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
goog.provide('audioCat.audio.junction.AnalyserJunction');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that analyzes the audio that goes through it, but does not alter
 * the audio itself.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number=} opt_numberOfOutputChannels The optional number of output
 *     channels. Unset if not provided.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.AnalyserJunction = function(
    idGenerator,
    audioContextManager,
    opt_numberOfOutputChannels) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.ANALYSER);

  /**
   * The analyser node that lets audio through.
   * @private {!AnalyserNode}
   */
  this.analyserNode_ = audioContextManager.createAnalyserNode();
  if (opt_numberOfOutputChannels) {
    // A channel count was specified.
    audioContextManager.setChannelCount(
        this.analyserNode_, opt_numberOfOutputChannels);
  }

  // 1 is not smoothened at all. 0 is perfectly smooth.
  audioContextManager.setSmoothingConstant(
      this.analyserNode_,
      audioCat.audio.Constant.ANALYSER_SMOOTHING);

  // Half of the FFT value is the frequency spectrum buffer length.
  audioContextManager.setFftSize(
      this.analyserNode_,
      audioCat.audio.Constant.ANALYSER_FFT_SIZE);
};
goog.inherits(
    audioCat.audio.junction.AnalyserJunction, audioCat.audio.junction.Junction);

/**
 * @return {number} The sample rate of the project.
 */
audioCat.audio.junction.AnalyserJunction.prototype.getSampleRate = function() {
  return this.audioContextManager.getSampleRate();
};

/**
 * @return {number} The frequency bin count. This is the size of the byte array
 *     that should be passed in for retrieving frequency data.
 */
audioCat.audio.junction.AnalyserJunction.prototype.getFrequencyBinCount =
    function() {
  return this.audioContextManager.getFrequencyBinCount(this.analyserNode_);
};

/**
 * Copies frequency data ranging from BYTE_FREQUENCY_MIN to BYTE_FREQUENCY_MAX,
 * inclusive into a Uint8Array. The size of the array should be the frequency
 * bin count. Constants are stored in audio/constants.js.
 * @param {!Uint8Array} buffer The buffer to copy frequency data into.
 */
audioCat.audio.junction.AnalyserJunction.prototype.copyFrequencyBytes =
    function(buffer) {
  this.audioContextManager.getByteFrequencyData(this.analyserNode_, buffer);
};

/**
 * Copies time-domain data ranging up to ANALYSER_TIME_DOMAIN_BYTE_MAX_VALUE,
 * inclusive into a Uint8Array. The size of the array should be the frequency
 * bin count. Constants are stored in audio/constants.js.
 * @param {!Uint8Array} buffer The buffer to copy frequency data into.
 */
audioCat.audio.junction.AnalyserJunction.prototype.copyTimeDomainDataBytes =
    function(buffer) {
  this.audioContextManager.getByteTimeDomainData(this.analyserNode_, buffer);
};

/** @override */
audioCat.audio.junction.AnalyserJunction.prototype.connect = function(
    junction) {
  this.analyserNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.AnalyserJunction.prototype.disconnect = function() {
  this.analyserNode_.disconnect();
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.AnalyserJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var offlineNode = this.audioContextManager.createAnalyserNode(
        opt_offlineAudioContext);
    this.audioContextManager.setChannelCount(
        offlineNode,
        this.audioContextManager.getChannelCount(this.analyserNode_));
    offlineNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineNode;
  }
  return this.analyserNode_;
};

/**
 * @return {number} The number of output channels for this node.
 */
audioCat.audio.junction.AnalyserJunction.prototype.getNumberOfOutputChannels =
    function() {
  return this.audioContextManager.getNumberOfOutputChannels(this.analyserNode_);
};

/** @override */
audioCat.audio.junction.AnalyserJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.analyserNode_.disconnect();
  this.cleanedUp = true;
};
