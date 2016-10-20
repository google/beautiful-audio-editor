goog.provide('audioCat.state.envelope.ControlPointsChangedEvent');

goog.require('audioCat.state.envelope.events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched when control points for an envelope are modified, added, or
 * removed.
 * @param {audioCat.state.envelope.ControlPointChange} kind Describes the kind
 *     of change that was made.
 * @param {!Array.<!audioCat.state.envelope.ControlPoint>} controlPoints A list
 *     control points that were directly alterd by the change.
 * @param {boolean} shuffleRequired Whether control points (or their ordering)
 *     aside from the ones in the controlPoints list were affected. If true,
 *     this often requires a complete re-positioning of all items.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.envelope.ControlPointsChangedEvent =
    function(kind, controlPoints, shuffleRequired) {
  goog.base(this, audioCat.state.envelope.events.CONTROL_POINTS_CHANGED);

  /**
   * The kind of change this was.
   * @private {audioCat.state.envelope.ControlPointChange}
   */
  this.kind_ = kind;

  /**
   * The control points directly altered by the change.
   * @private {!Array.<!audioCat.state.envelope.ControlPoint>}
   */
  this.controlPoints_ = controlPoints;

  /**
   * Whether control points aside from the ones listed above (or their ordering)
   * were affected.
   * @private {boolean}
   */
  this.shuffleRequired_ = shuffleRequired;
};
goog.inherits(
    audioCat.state.envelope.ControlPointsChangedEvent, audioCat.utility.Event);

/**
 * @return {audioCat.state.envelope.ControlPointChange} The type of change this
 *     was.
 */
audioCat.state.envelope.ControlPointsChangedEvent.prototype.getKind =
    function() {
  return this.kind_;
};

/**
 * @return {!Array.<!audioCat.state.envelope.ControlPoint>} Control points
 *     directly altered by the change.
 */
audioCat.state.envelope.ControlPointsChangedEvent.prototype.getControlPoints =
    function() {
  return this.controlPoints_;
};

/**
 * @return {boolean} Whether other control points or their ordering were
 *     affected.
 */
audioCat.state.envelope.ControlPointsChangedEvent.prototype.getShuffleRequired =
    function() {
  return this.shuffleRequired_;
};
