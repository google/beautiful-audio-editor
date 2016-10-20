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

