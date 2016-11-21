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
goog.provide('audioCat.state.envelope.ControlPointChangedEvent');

goog.require('audioCat.state.envelope.events');
goog.require('audioCat.utility.Event');


/**
 * Event dispatched by a control point when it is changed.
 * @param {number} previousTime The previous time in seconds.
 * @param {number} previousValue The previous value.
 * @param {number} time The new time.
 * @param {number} value The new value.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.envelope.ControlPointChangedEvent =
    function(previousTime, previousValue, time, value) {
  goog.base(this, audioCat.state.envelope.events.CONTROL_POINT_CHANGED);

  /**
   * The previous time in seconds.
   * @private {number}
   */
  this.previousTime_ = previousTime;

  /**
   * The previous value.
   * @private {number}
   */
  this.previousValue_ = previousValue;

  /**
   * The new time in seconds.
   * @private {number}
   */
  this.time_ = time;

  /**
   * The new value.
   * @private {number}
   */
  this.value_ = value;
};
goog.inherits(
    audioCat.state.envelope.ControlPointChangedEvent, audioCat.utility.Event);

/**
 * @return {number} The previous time in seconds.
 */
audioCat.state.envelope.ControlPointChangedEvent.prototype.getPreviousTime =
    function() {
  return this.previousTime_;
};

/**
 * @return {number} The previous value.
 */
audioCat.state.envelope.ControlPointChangedEvent.prototype.getPreviousValue =
    function() {
  return this.previousValue_;
};

/**
 * @return {number} The new time in seconds.
 */
audioCat.state.envelope.ControlPointChangedEvent.prototype.getTime =
    function() {
  return this.time_;
};

/**
 * @return {number} The new value.
 */
audioCat.state.envelope.ControlPointChangedEvent.prototype.getValue =
    function() {
  return this.value_;
};

