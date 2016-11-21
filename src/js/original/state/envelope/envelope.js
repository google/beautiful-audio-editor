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
goog.provide('audioCat.state.envelope.Envelope');

goog.require('audioCat.state.envelope.ControlPoint');
goog.require('audioCat.state.envelope.ControlPoint.compareByTime');
goog.require('audioCat.state.envelope.ControlPointChange');
goog.require('audioCat.state.envelope.ControlPointsChangedEvent');
goog.require('audioCat.state.envelope.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.events');
goog.require('goog.math');


/**
 * Allows for fine control of a certain variable such as volume throughout a
 * track via using control points.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates an ID unique
 *     throughout the application.
 * @param {string} name The name of the envelope. Does not have to be unique
 *     throughout the application.
 * @param {number} initialValue The initial value of the envelope - assuming no
 *     control points.
 * @param {number} min The minimum value for control points.
 * @param {number} max The maximum value for control points.
 * @param {string} units The units of the state value for the envelope.
 * @param {!Array.<!audioCat.state.envelope.ControlPoint>=} opt_controlPoints
 *     A list of initial control points sorted by time. If not provided, assumed
 *     empty.
 * @param {string=} opt_bottomLabel An optional label for the bottom of the
 *     envelope. Defaults to the minimum value cast into a string and then
 *     concatenated to the right with the units.
 * @param {string=} opt_middleLabel An optional label for the middle line of the
 *     envelope. Defaults to the initial value cast into string, + units.
 * @param {string=} opt_topLabel An optional label for the top of the envelope.
 *     Defaults to max value + units.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.envelope.Envelope = function(
    idGenerator,
    name,
    initialValue,
    min,
    max,
    units,
    opt_controlPoints,
    opt_bottomLabel,
    opt_middleLabel,
    opt_topLabel) {
  goog.base(this);

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The name of the envelope.
   * @private {string}
   */
  this.name_ = name;

  /**
   * The value of the envelope without any control points.
   * @private {number}
   */
  this.initialValue_ = initialValue;

  /**
   * The minimum value for control points.
   * @private {number}
   */
  this.min_ = min;

  /**
   * The maximum value for control points.
   * @private {number}
   */
  this.max_ = max;

  /**
   * The label for the bottom of the envelope.
   * @private {string}
   */
  this.bottomLabel_ = opt_bottomLabel || String(min) + units;

  /**
   * The label for the default value of the envelope.
   * @private {string}
   */
  this.middleLabel_ = opt_middleLabel || String(initialValue) + units;

  /**
   * The label for the top of the envelope.
   * @private {string}
   */
  this.topLabel_ = opt_topLabel || String(max) + units;

  /**
   * The units of the state value.
   * @private {string}
   */
  this.units_ = units;

  /**
   * A list of control points sorted by time.
   * @private {!Array.<!audioCat.state.envelope.ControlPoint>}
   */
  this.controlPoints_ = opt_controlPoints || [];
  for (var i = 0; i < this.controlPoints_.length; ++i) {
    goog.events.listen(this.controlPoints_[i],
        audioCat.state.envelope.events.CONTROL_POINT_CHANGED,
        this.handleControlPointChanged_, false, this);
  }
};
goog.inherits(audioCat.state.envelope.Envelope, audioCat.utility.EventTarget);

/**
 * @return {string} The name of the envelope.
 */
audioCat.state.envelope.Envelope.prototype.getName = function() {
  return this.name_;
};

/**
 * @return {number} The initial value of the envelope. A float.
 */
audioCat.state.envelope.Envelope.prototype.getInitialValue = function() {
  return this.initialValue_;
};

/**
 * @return {number} The min value of the envelope. A float.
 */
audioCat.state.envelope.Envelope.prototype.getMin = function() {
  return this.min_;
};

/**
 * @return {number} The max value of the envelope. A float.
 */
audioCat.state.envelope.Envelope.prototype.getMax = function() {
  return this.max_;
};

/**
 * @return {string} The units of the state value.
 */
audioCat.state.envelope.Envelope.prototype.getUnits = function() {
  return this.units_;
};

/**
 * @return {string} The top label of the envelope.
 */
audioCat.state.envelope.Envelope.prototype.getTopLabel = function() {
  return this.topLabel_;
};

/**
 * @return {string} The default value label of the envelope.
 */
audioCat.state.envelope.Envelope.prototype.getMiddleLabel = function() {
  return this.middleLabel_;
};

/**
 * @return {string} The bottom value label of the envelope.
 */
audioCat.state.envelope.Envelope.prototype.getBottomLabel = function() {
  return this.bottomLabel_;
};

/**
 * Gets the control point at a certain index. Control points are indexed based
 * on begin time.
 * @param {number} index The index of the control point sought after.
 * @return {!audioCat.state.envelope.ControlPoint} The control point located at
 *     the given index.
 */
audioCat.state.envelope.Envelope.prototype.getControlPointAtIndex =
    function(index) {
  return this.controlPoints_[index];
};

/**
 * Obtains the index of the rightmost control point with a time less than or
 * equal to the given time. If no such control point exists, then returns -1.
 * @param {number} targetTime The time in seconds to search for.
 * @return {number} The index as described.
 */
audioCat.state.envelope.Envelope.prototype.obtainLowerBound =
    function(targetTime) {
  var bestSoFar = -1;
  var controlPoints = this.controlPoints_;
  var low = 0;
  var high = controlPoints.length - 1;
  while (low <= high) {
    var mid = low + Math.floor((high - low) / 2);
    var time = controlPoints[mid].getTime();
    if (targetTime >= time) {
      bestSoFar = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return bestSoFar;
};

/**
 * Obtains the index of the leftmost control point with a time greater than or
 * equal to the given time. If no such control point exists, returns -1.
 * @param {number} targetTime The time in seconds to search for.
 * @return {number} The index as described.
 */
audioCat.state.envelope.Envelope.prototype.obtainUpperBound =
    function(targetTime) {
  var bestSoFar = -1;
  var controlPoints = this.controlPoints_;
  var low = 0;
  var high = controlPoints.length - 1;
  while (low <= high) {
    var mid = low + Math.floor((high - low) / 2);
    var time = controlPoints[mid].getTime();
    if (targetTime <= time) {
      bestSoFar = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return bestSoFar;
};

/**
 * @return {number} The number of control points in this envelope.
 */
audioCat.state.envelope.Envelope.prototype.getNumberOfControlPoints =
    function() {
  return this.controlPoints_.length;
};

/**
 * Creates a new control point, and adds it to the envelope.
 * @param {number} time The time in seconds of the control point.
 * @param {number} value The value of the control point. Must be within
 *     [min, max] of this envelope.
 * @return {!audioCat.state.envelope.ControlPoint} The control point.
 */
audioCat.state.envelope.Envelope.prototype.createControlPoint =
    function(time, value) {
  return new audioCat.state.envelope.ControlPoint(
      this.idGenerator_, time, value);
};

/**
 * Removes a control point from the envelope.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     to remove.
 */
audioCat.state.envelope.Envelope.prototype.removeControlPoint =
    function(controlPoint) {
  goog.array.binaryRemove(this.controlPoints_, controlPoint,
      audioCat.state.envelope.ControlPoint.compareByTime);
  this.dispatchEvent(new audioCat.state.envelope.ControlPointsChangedEvent(
      audioCat.state.envelope.ControlPointChange.REMOVED, [controlPoint],
      true));
};

/**
 * Adds a control point to the envelope.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     to add.
 */
audioCat.state.envelope.Envelope.prototype.addControlPoint =
    function(controlPoint) {
  goog.array.binaryInsert(this.controlPoints_, controlPoint,
      audioCat.state.envelope.ControlPoint.compareByTime);

  // TODO(chizeng): Listen for changes in the control point. Stop listening
  // once the control point is removed.
  goog.events.listen(controlPoint,
      audioCat.state.envelope.events.CONTROL_POINT_CHANGED,
      this.handleControlPointChanged_, false, this);
  this.dispatchEvent(new audioCat.state.envelope.ControlPointsChangedEvent(
      audioCat.state.envelope.ControlPointChange.ADDED, [controlPoint], true));
};

/**
 * Handles what happens when a control point changes.
 * @param {!audioCat.state.envelope.ControlPointChangedEvent} event
 * @private
 */
audioCat.state.envelope.Envelope.prototype.handleControlPointChanged_ =
    function(event) {
  var controlPoint = /** @type {!audioCat.state.envelope.ControlPoint} */ (
      event.target);
  var controlPoints = this.controlPoints_;
  var previousTime = event.getPreviousTime();
  var compareFunction = audioCat.state.envelope.ControlPoint.compareByTime;

  var shufflingNeeded = false;
  if (controlPoints.length > 1) {
    var low = 0;
    var high = controlPoints.length - 1;
    var mid;

    var previousIndex;
    while (low <= high) {
      mid = low + Math.floor((high - low) / 2);
      var currentControlPoint = controlPoints[mid];
      if (currentControlPoint.getId() == controlPoint.getId()) {
        previousIndex = mid;
        break;
      }

      var difference;
      if (goog.math.nearlyEquals(currentControlPoint.getTime(), previousTime)) {
        difference = currentControlPoint.getId() - controlPoint.getId();
      } else {
        difference = currentControlPoint.getTime() - previousTime;
      }

      if (difference < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    previousIndex = /** @type {number} */ (previousIndex);
    if (previousIndex == 0) {
      shufflingNeeded = compareFunction(controlPoint, controlPoints[1]) > 0;
    } else if (previousIndex == controlPoints.length - 1) {
      shufflingNeeded =
          compareFunction(controlPoint, controlPoints[previousIndex - 1]) < 0;
    } else {
      shufflingNeeded =
          compareFunction(controlPoint, controlPoints[previousIndex - 1]) < 0 ||
          compareFunction(controlPoint, controlPoints[previousIndex + 1]) > 0;
    }

    if (shufflingNeeded) {
      goog.array.removeAt(controlPoints, previousIndex);
      goog.array.binaryInsert(controlPoints, controlPoint, compareFunction);
    }
  }

  this.dispatchEvent(new audioCat.state.envelope.ControlPointsChangedEvent(
      audioCat.state.envelope.ControlPointChange.MODIFIED, [controlPoint],
      shufflingNeeded));
};
