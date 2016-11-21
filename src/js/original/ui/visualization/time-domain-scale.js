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
goog.provide('audioCat.ui.visualization.TimeDomainScale');

goog.require('audioCat.ui.visualization.TimeUnit');
goog.require('goog.asserts');


/**
 * Provides the scale at which to visualize audio.
 * @param {number} majorTickWidth The width in pixels of a single major tick.
 * @param {number} majorTickTime The number of time units the major tick
 *     represents.
 * @param {!audioCat.ui.visualization.TimeUnit} timeUnit The time unit to use
 *     for display.
 * @param {number} decimalPlaces The number of decimal places to round to.
 * @param {number} minorTickCount The number of minor ticks per major tick to
 *     draw.
 * @constructor
 */
audioCat.ui.visualization.TimeDomainScale = function(
    majorTickWidth,
    majorTickTime,
    timeUnit,
    decimalPlaces,
    minorTickCount) {
  /**
   * Integer. The major tick width in pixels.
   * @private {number}
   */
  this.majorTickWidth_ = majorTickWidth;

  /**
   * The number of time units the major tick represents.
   * @private {number}
   */
  this.majorTickTime_ = majorTickTime;

  /**
   * The time unit to use for display.
   * @private {!audioCat.ui.visualization.TimeUnit}
   */
  this.timeUnit_ = timeUnit;

  /**
   * The number of decimal places to round to.
   * @private {number}
   */
  this.numberOfDecimalPlaces_ = decimalPlaces;

  /**
   * The number of minor ticks per major tick to draw.
   * @private {number}
   */
  this.minorTicksPerMajorTick_ = minorTickCount;

  var unitsPerSecond = 0;
  switch (timeUnit) {
    case audioCat.ui.visualization.TimeUnit.S:
      unitsPerSecond = 1;
      break;
    case audioCat.ui.visualization.TimeUnit.MS:
      unitsPerSecond = 1000;
      break;
    default:
      // We are missing a unit.
      throw 1;
  }

  /**
   * The ratio of pixels to seconds.
   * @private {number}
   */
  this.pixelsPerSecond_ =
      this.majorTickWidth_ / this.majorTickTime_ * unitsPerSecond;
};

/**
 * @return {number} The major tick width in pixels.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getMajorTickWidth =
    function() {
  return this.majorTickWidth_;
};

/**
 * @return {number} The time in the time units that each major tick represents.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getMajorTickTime =
    function() {
  return this.majorTickTime_;
};

/**
 * @return {!audioCat.ui.visualization.TimeUnit} The time unit to display.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getTimeUnit =
    function() {
  return this.timeUnit_;
};

/**
 * @return {number} The number of decimal places to round major tick values.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getDecimalPlaces =
    function() {
  return this.numberOfDecimalPlaces_;
};

/**
 * @return {number} The number of minor ticks to draw per major tick.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getMinorTicksPerMajorTick =
    function() {
  return this.minorTicksPerMajorTick_;
};

/**
 * Converts from pixels to seconds based on the current scale.
 * @param {number} pixels The number of pixels.
 * @return {number} The time in seconds based on the current scale.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.convertToSeconds =
    function(pixels) {
  return this.getSecondsFromTimeUnits(
      pixels * this.majorTickTime_ / this.majorTickWidth_);
};

/**
 * Converts time units for this scale - it could be seconds or milliseconds for
 * instance into seconds.
 * @param {number} timeUnits The number of time units (that are used for this
 *     scale).
 * @return {number} The equivalent number of seconds.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.getSecondsFromTimeUnits =
    function(timeUnits) {
  var unitsPerSecond;
  switch (this.timeUnit_) {
    case audioCat.ui.visualization.TimeUnit.S:
      unitsPerSecond = 1;
      break;
    case audioCat.ui.visualization.TimeUnit.MS:
      unitsPerSecond = 1000;
      break;
  }
  goog.asserts.assert(unitsPerSecond);
  return timeUnits / unitsPerSecond;
};

/**
 * Converts from seconds to pixels based on the current scale.
 * @param {number} seconds The time in seconds to convert to pixels.
 * @return {number} The number of pixels tantamount to the seconds.
 */
audioCat.ui.visualization.TimeDomainScale.prototype.convertToPixels =
    function(seconds) {
  return seconds * this.pixelsPerSecond_;
};
