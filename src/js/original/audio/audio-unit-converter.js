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
