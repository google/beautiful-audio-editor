goog.provide('audioCat.audio.junction.ClipDetectorJunction');

goog.require('audioCat.audio.junction.ScriptProcessorJunction');


/**
 * A special script processor junction that is used for detecting clipping.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} numberOfChannels The number of channels.
 * @constructor
 * @extends {audioCat.audio.junction.ScriptProcessorJunction}
 */
audioCat.audio.junction.ClipDetectorJunction = function(
    idGenerator,
    audioContextManager,
    numberOfChannels) {
  var maxSampleValuesPerChannel = new Array(numberOfChannels);
  this.resetMaxSamples_(maxSampleValuesPerChannel);
  /**
   * The maximum sample value for each channel per frame drawn. Continuously
   * computed so long as playing is occuring. May be reset whenever manually
   * by calling {@code resetMaxSamples}.
   * @private {!Array.<number>}
   */
  this.maxSampleValuesPerChannel_ = maxSampleValuesPerChannel;

  goog.base(
      this,
      idGenerator,
      audioContextManager,
      numberOfChannels,
      goog.bind(this.handleAudioProcessing_, this, numberOfChannels));
};
goog.inherits(audioCat.audio.junction.ClipDetectorJunction,
    audioCat.audio.junction.ScriptProcessorJunction);

/**
 * Resets the max sample values per channel so that we can begin recomputing it.
 */
audioCat.audio.junction.ClipDetectorJunction.prototype.resetMaxSamples =
    function() {
  this.resetMaxSamples_(this.maxSampleValuesPerChannel_);
};

/**
 * Obtains the max absolute sample value for a given channel for the previous
 * frame.
 * @param {number} channelIndex The index of the channel to get the max absolute
 *     sample value for.
 * @return {number} The stable max absolute sample value.
 */
audioCat.audio.junction.ClipDetectorJunction.prototype.getStableChannelMax =
    function(channelIndex) {
  return this.maxSampleValuesPerChannel_[channelIndex];
};

/**
 * Handles what happens when some audio has been processed.
 * @param {number} inputChannels The number of input channels.
 * @param {!AudioProcessingEvent} event The event associated with some buffer of
 *     audio having been processed.
 * @private
 */
audioCat.audio.junction.ClipDetectorJunction.prototype.handleAudioProcessing_ =
    function(inputChannels, event) {
  var maxSampleValuesPerChannel = this.maxSampleValuesPerChannel_;

  // Poll every other this many samples for clipping.
  var everyOtherN = 400;

  for (var i = 0; i < inputChannels; ++i) {
    var samples = event.inputBuffer.getChannelData(i);
    var sampleLength = samples.length;
    var sampleIndex = 0;
    while (sampleIndex < sampleLength) {
      var sampleAbsoluteValue = samples[sampleIndex];
      if (sampleAbsoluteValue < 0) {
        sampleAbsoluteValue = 0 - sampleAbsoluteValue;
      }
      if (sampleAbsoluteValue > maxSampleValuesPerChannel[i]) {
        maxSampleValuesPerChannel[i] = sampleAbsoluteValue;
      }
      sampleIndex += everyOtherN;
    }
  }
};

/**
 * Resets the array of max sample values so we can compute it again.
 * @param {!Array.<number>} maxSamplesPerChannel The array containing max
 *     samples per channel.
 * @private
 */
audioCat.audio.junction.ClipDetectorJunction.prototype.resetMaxSamples_ =
    function(maxSamplesPerChannel) {
  var numberOfChannels = maxSamplesPerChannel.length;
  for (var i = 0; i < numberOfChannels; ++i) {
    maxSamplesPerChannel[i] = 0;
  }
};
