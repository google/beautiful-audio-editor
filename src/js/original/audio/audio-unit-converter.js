goog.provide('audioCat.audio.AudioUnitConverter');

goog.require('audioCat.audio.Constant');


/**
 * Converts between decibels and raw sample units. Also converts between various
 * standards related to audio.
 * @constructor
 */
audioCat.audio.AudioUnitConverter = function() {};

/**
 * Converts a raw sample value to a decibel value.
 * @param {number} sampleValue THe sample value.
 * @return {number} The corresponding decibel value.
 */
audioCat.audio.AudioUnitConverter.prototype.convertSampleToDecibel = function(
    sampleValue) {
  return 20 * Math.log(sampleValue) / audioCat.audio.Constant.LOG10;
};

/**
 * Converts a decibel value to a sample value.
 * @param {number} decibels The decibel value.
 * @return {number} The corresponding sample value.
 */
audioCat.audio.AudioUnitConverter.prototype.convertDecibelToSample = function(
    decibels) {
  return Math.pow(10, decibels / 20);
};
