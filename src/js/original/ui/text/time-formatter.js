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
goog.provide('audioCat.ui.text.TimeFormatter');

goog.require('audioCat.ui.text.Precision');
goog.require('audioCat.ui.visualization.TimeUnit');


/**
 * Formats time.
 * @constructor
 */
audioCat.ui.text.TimeFormatter = function() {};

/**
 * Formats time in seconds into the format H:MM:SS:MSS. Assumes that the given
 * smallest precision is more precise than the given biggest precision.
 * @param {number} timeInSeconds The time value in seconds.
 * @param {audioCat.ui.text.Precision=} opt_smallestUnit The smallest precision
 *     for the resulting time display. Defaults to MS.
 * @param {audioCat.ui.text.Precision=} opt_biggestUnit The biggest unit of time
 *     to include in the display. Defaults to H (hours).
 * @return {string} The formatted time as a string.
 */
audioCat.ui.text.TimeFormatter.prototype.formatTime =
    function(timeInSeconds, opt_smallestUnit, opt_biggestUnit) {
  var smallestUnit = opt_smallestUnit || audioCat.ui.text.Precision.MS;
  var biggestUnit = opt_biggestUnit || audioCat.ui.text.Precision.H;

  var timeString = this.computeTimeTextSection_(timeInSeconds, biggestUnit);
  for (var i = biggestUnit - 1; i >= smallestUnit; --i) {
    timeString += ':' + this.computeTimeTextSection_(
        timeInSeconds, /** @type {audioCat.ui.text.Precision} */ (i));
  }
  return timeString;
};

/**
 * Creates a string representation of some time in seconds given a scale.
 * @param {number} timeInSeconds Some time in seconds.
 * @param {!audioCat.ui.visualization.TimeDomainScale} scale The scale to use
 *     for printing out the text representation.
 * @param {audioCat.ui.text.Precision=} opt_precision How precise to make the
 *     representation. This is specified as a unit like
 *     audioCat.ui.text.Precision.MS. Defaults to the major unit of the scale,
 *     which may be too crude for some representation purposes.
 * @return {string} The string representation of the time.
 */
audioCat.ui.text.TimeFormatter.prototype.formatTimeGivenScale =
    function(timeInSeconds, scale, opt_precision) {
  var smallestUnit;
  var scaleMajorTimeUnit = scale.getTimeUnit();
  if (opt_precision) {
    smallestUnit = opt_precision;
  } else {
    switch (scaleMajorTimeUnit) {
      case audioCat.ui.visualization.TimeUnit.S:
        smallestUnit = audioCat.ui.text.Precision.S;
        break;
      case audioCat.ui.visualization.TimeUnit.MS:
        smallestUnit = audioCat.ui.text.Precision.MS;
        break;
    }
    goog.asserts.assert(goog.isDef(smallestUnit));
  }
  return this.formatTime(timeInSeconds, smallestUnit);
};

/**
 * Computes the text for a certain section in the time format.
 * @param {number} timeInSeconds The time in seconds.
 * @param {audioCat.ui.text.Precision} precision The portion of the format to
 *     compute.
 * @return {string} The text representation of that portion of the time format.
 * @private
 */
audioCat.ui.text.TimeFormatter.prototype.computeTimeTextSection_ =
    function(timeInSeconds, precision) {
  var precisionEnum = audioCat.ui.text.Precision;
  switch (precision) {
    case precisionEnum.H:
      return String(Math.floor(timeInSeconds / 3600));
    case precisionEnum.MIN:
      return ('0' + (Math.floor(timeInSeconds / 60) % 60)).slice(-2);
    case precisionEnum.S:
      return ('0' + (Math.floor(timeInSeconds) % 60)).slice(-2);
    case precisionEnum.MS:
      return ('00' + (Math.floor(timeInSeconds * 1000) % 1000)).slice(-3);
  }

  // Invalid precision specified.
  throw 3;
};
