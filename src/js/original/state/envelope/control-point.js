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
goog.provide('audioCat.state.envelope.ControlPoint');
goog.provide('audioCat.state.envelope.ControlPoint.compareByTime');

goog.require('audioCat.state.envelope.ControlPointChangedEvent');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.math');


/**
 * Allows a user to carefully specify bounds of an envelope.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates an ID unique
 *     throughout the application.
 * @param {number} time The time in seconds at which the control point is
 *     located.
 * @param {number} value The value at which the control point is located.
 *     The value should be within [min, max] as defined by the envelope.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.envelope.ControlPoint = function(idGenerator, time, value) {
  goog.base(this);

  /**
   * An ID unique to this control point.
   * @private {!audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * The time in seconds.
   * @private {number}
   */
  this.time_ = time;

  /**
   * The value.
   * @private {number}
   */
  this.value_ = value;
};
goog.inherits(
    audioCat.state.envelope.ControlPoint, audioCat.utility.EventTarget);

/**
 * Sets the time-value combination of the control point.
 * @param {number} time The new time in seconds.
 * @param {number} value The new value.
 */
audioCat.state.envelope.ControlPoint.prototype.set = function(time, value) {
  var previousTime = this.time_;
  var previousValue = this.value_;
  this.time_ = time;
  this.value_ = value;
  this.dispatchEvent(new audioCat.state.envelope.ControlPointChangedEvent(
      previousTime, previousValue, time, value));
};

/**
 * @return {number} The time of the control point.
 */
audioCat.state.envelope.ControlPoint.prototype.getTime = function() {
  return this.time_;
};

/**
 * @return {number} The value of the control point.
 */
audioCat.state.envelope.ControlPoint.prototype.getValue = function() {
  return this.value_;
};

/**
 * @return {number} The unique ID of the control point.
 */
audioCat.state.envelope.ControlPoint.prototype.getId = function() {
  return this.id_;
};

/**
 * Static method for comparing two control points by their times.
 * @param {!audioCat.state.envelope.ControlPoint} point1
 * @param {!audioCat.state.envelope.ControlPoint} point2
 * @return {number} A negative number if point1 occurs first, a positive number
 *     if point2 occurs first. If times are the same, does an ID comparison.
 */
audioCat.state.envelope.ControlPoint.compareByTime = function(point1, point2) {
  var time1 = point1.getTime();
  var time2 = point2.getTime();
  if (goog.math.nearlyEquals(time1, time2)) {
    // The arguments are only equal if they have the same ID. This is
    // important for binary search to work correctly.
    return point1.getId() - point2.getId();
  }
  return time1 - time2;
};
