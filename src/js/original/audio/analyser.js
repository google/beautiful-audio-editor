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
goog.provide('audioCat.audio.Analyser');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Analyzes audio. Otherwise lets audio through unedited.
 * @param {number} numberOfOutputChannels The number of output channels.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.Analyser = function(numberOfOutputChannels) {
  goog.base(this);

  /**
   * The analyser junction to get data from. Could be null.
   * @private {audioCat.audio.junction.AnalyserJunction}
   */
  this.analyserJunction_ = null;

  /**
   * The clip detection junction to get data from. Could be null.
   * @private {audioCat.audio.junction.ClipDetectorJunction}
   */
  this.clipDetectorJunction_ = null;

  /**
   * Analyser junctions (one per channel) used for clip detection.
   * @private {Array.<!audioCat.audio.junction.AnalyserJunction>}
   */
  this.channelAnalyserJunctions_ = null;

  /**
   * Contains byte frequency data. Only makes sense if an analyser junction
   * exists.
   * @private {Uint8Array}
   */
  this.byteFrequencyData_ = null;

  var maxes = new Array(numberOfOutputChannels);
  /**
   * The most recently computed max sample values per channel.
   * @private {!Array.<number>}
   */
  this.maxPerChannel_ = maxes;
};
goog.inherits(audioCat.audio.Analyser, audioCat.utility.EventTarget);


/**
 * An array containing frequency values we seek responses for. Null if not yet
 * initialized.
 * @type {Float32Array}
 */
audioCat.audio.Analyser.FREQUENCIES = null;


/**
 * An array containing magnitude response values for various frequencies.
 * Null if not yet initialized.
 * @type {Float32Array}
 */
audioCat.audio.Analyser.MAG_RESPONSE = null;


/**
 * An array containing phase response values for various frequencies.
 * Null if not yet initialized.
 * @type {Float32Array}
 */
audioCat.audio.Analyser.PHASE_RESPONSE = null;


/**
 * An array containing recently obtained time domain data. The length of this
 * array is the FFT size of the analyser.
 * @type {Uint8Array}
 */
audioCat.audio.Analyser.BYTE_TIME_DOMAIN_MAGNITUDES = null;


/**
 * The previously visualized max frequency. Null if none yet.
 * @type {?number}
 */
audioCat.audio.Analyser.MAX_FREQUENCY = null;

/**
 * Obtains the currently recorded max absolute sample value for a channel.
 * Assumes that the channel index is valid.
 * @param {number} channelIndex The index of the channel to get the recent max
 *     absolute sample value for.
 * @return The currently recorded max absolute sample value for a channel. This
 *     means the max since the last time {@code resetClipDetector} was called or
 *     0 if the clip detector junction is not set.
 */
audioCat.audio.Analyser.prototype.obtainCurrentSampleMax =
    function(channelIndex) {
  return this.channelAnalyserJunctions_ ? this.maxPerChannel_[channelIndex] : 0;
};

/**
 * Computes the max sample values for each channel for subsequent retrieval.
 */
audioCat.audio.Analyser.prototype.computeCurrentSampleMaxesPerChannel =
    function() {
  if (this.channelAnalyserJunctions_) {
    var numberOfChannels = this.channelAnalyserJunctions_.length;
    var byteTimeDomainData = this.getByteTimeDomainData();
    var byteLength = byteTimeDomainData.length;
    for (var i = 0; i < numberOfChannels; ++i) {
      // // Use a canary value to see if we made updates. The native copy
      // // function fails silently and does nothing if no updates were made.
      // byteTimeDomainData[0] =
      //     audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_BYTE_MIN_VALUE - 1;
      this.channelAnalyserJunctions_[i].copyTimeDomainDataBytes(
          byteTimeDomainData);
      // if (byteTimeDomainData[0] <
      //     audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_BYTE_MIN_VALUE) {
      //   // No updates were made, so the sound had not been playing.
      //   this.resetMaxSamplesForChannels();
      //   break;
      // }
      var max = audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_BYTE_MIN_VALUE;
      for (var j = 0; j < byteLength; ++j) {
        if (byteTimeDomainData[j] > max) {
          max = byteTimeDomainData[j];
        }
      }
      this.maxPerChannel_[i] =
          (max - audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_BYTE_MIN_VALUE) /
              audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_VALUE_RANGE;
    }
  } else {
    this.resetMaxSamplesForChannels();
  }
};

/**
 * Resets the computed max samples per channel.
 */
audioCat.audio.Analyser.prototype.resetMaxSamplesForChannels = function() {
  var numberOfOutputChannels = this.maxPerChannel_.length;
  for (var i = 0; i < numberOfOutputChannels; ++i) {
    this.maxPerChannel_[i] = 0;
  }
};

/**
 * Resets the clip detector junction if it exists. Otherwise, a nop.
 */
audioCat.audio.Analyser.prototype.resetClipDetector = function() {
  if (this.clipDetectorJunction_) {
    this.clipDetectorJunction_.resetMaxSamples();
  }
};

/**
 * Sets the clip detector junction. Or nulls it out if null or not provided.
 * @param {audioCat.audio.junction.ClipDetectorJunction} clipDetectorJunction
 *     The clip detector junction to set or null to unset the junction.
 */
audioCat.audio.Analyser.prototype.setClipDetectorJunction =
    function(clipDetectorJunction) {
  this.clipDetectorJunction_ = clipDetectorJunction;
};

/**
 * Sets an array of analyser junctions (one for each channel) to use for clip
 * detection.
 * @param {Array.<!audioCat.audio.junction.AnalyserJunction>}
 *     channelAnalyserJunctions The array of analyser junctions. If null, unsets
 *     the analyser junctions.
 */
audioCat.audio.Analyser.prototype.setChannelAnalyserJunctions =
    function(channelAnalyserJunctions) {
  this.channelAnalyserJunctions_ = channelAnalyserJunctions;
};

/**
 * Obtains the array of frequency values. Assumes that the analyser junction
 * corresponding to this analyser exists.
 * @return {!Float32Array} The singleton array of frequency values.
 */
audioCat.audio.Analyser.prototype.getFrequencyArray =
    function() {
  var sampleRate = this.getSampleRate();
  goog.asserts.assert(!goog.isNull(sampleRate));
  var maxFrequency = sampleRate / 2;
  var frequencies = audioCat.audio.Analyser.FREQUENCIES;
  if (!frequencies || maxFrequency !=
      audioCat.audio.Analyser.MAX_FREQUENCY) {
    // We need a new array of frequencies.
    var frequencyBins = audioCat.audio.Constant.ANALYSER_BUFFER_SIZE;
    frequencies = new Float32Array(frequencyBins);
    for (var i = 0; i < frequencyBins; ++i) {
      frequencies[i] = i * maxFrequency / frequencyBins;
    }
    audioCat.audio.Analyser.MAX_FREQUENCY = maxFrequency;
    audioCat.audio.Analyser.FREQUENCIES = frequencies;
  }
  goog.asserts.assert(audioCat.audio.Analyser.FREQUENCIES);
  return audioCat.audio.Analyser.FREQUENCIES;
};

/**
 * @return {!Float32Array} The singleton array of magnitude response values per
 *     frequency.
 */
audioCat.audio.Analyser.prototype.getMagResponseArray =
    function() {
  if (!audioCat.audio.Analyser.MAG_RESPONSE) {
    audioCat.audio.Analyser.MAG_RESPONSE =
        new Float32Array(audioCat.audio.Constant.ANALYSER_BUFFER_SIZE);
  }
  return audioCat.audio.Analyser.MAG_RESPONSE;
};

/**
 * @return {!Float32Array} The singleton array of phase response values per
 *     frequency.
 */
audioCat.audio.Analyser.prototype.getPhaseResponseArray = function() {
  if (!audioCat.audio.Analyser.PHASE_RESPONSE) {
    audioCat.audio.Analyser.PHASE_RESPONSE =
        new Float32Array(audioCat.audio.Constant.ANALYSER_BUFFER_SIZE);
  }
  return audioCat.audio.Analyser.PHASE_RESPONSE;
};

/**
 * @return {!Uint8Array} The singleton array of byte-sized time-domain sample
 *     values.
 */
audioCat.audio.Analyser.prototype.getByteTimeDomainData = function() {
  if (!audioCat.audio.Analyser.BYTE_TIME_DOMAIN_MAGNITUDES) {
    audioCat.audio.Analyser.BYTE_TIME_DOMAIN_MAGNITUDES = new Uint8Array(
        audioCat.audio.Constant.ANALYSER_TIME_DOMAIN_BYTE_DATA_SIZE);
  }
  return audioCat.audio.Analyser.BYTE_TIME_DOMAIN_MAGNITUDES;
};

/**
 * Sets the analyser junction for this node to retrieve data from. Set to null
 * to make the analyser have no analyser junction.
 * @param {audioCat.audio.junction.AnalyserJunction} analyserJunction
 */
audioCat.audio.Analyser.prototype.setAnalyserJunction = function(
    analyserJunction) {
  this.analyserJunction_ = analyserJunction;
  this.byteFrequencyData_ = analyserJunction ?
      (new Uint8Array(analyserJunction.getFrequencyBinCount())) :
      null;
  this.dispatchEvent(audioCat.state.events.ANALYSER_READY);
};

/**
 * @return {Uint8Array} Either the frequency byte data or null if the data does
 *     not yet exist. Overrides the previous data before returning.
 */
audioCat.audio.Analyser.prototype.getByteFrequencyData = function() {
  if (!this.byteFrequencyData_) {
    return null;
  }
  this.analyserJunction_.copyFrequencyBytes(this.byteFrequencyData_);
  return this.byteFrequencyData_;
};

/**
 * @return {number?} Either the sample rate or null if the data does not yet
 * exist.
 */
audioCat.audio.Analyser.prototype.getSampleRate = function() {
  return this.analyserJunction_ ? this.analyserJunction_.getSampleRate() : null;
};
