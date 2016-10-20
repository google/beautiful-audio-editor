goog.provide('audioCat.state.command.MoveControlPointCommand');

goog.require('audioCat.state.command.Command');


/**
 * Moves a control point. Does not add or remove it. Just alters its time and/or
 * value.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The track to
 *     remove.
 * @param {number} originalTime The original time before modification.
 * @param {number} originalValue The original value before modification.
 * @param {number} newTime The new time in seconds.
 * @param {number} newValue The new value.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.MoveControlPointCommand = function(
    controlPoint,
    originalTime,
    originalValue,
    newTime,
    newValue,
    idGenerator) {
  goog.base(this, idGenerator, true);
  /**
   * The control point to modify.
   * @private {!audioCat.state.envelope.ControlPoint}
   */
  this.controlPoint_ = controlPoint;

  /**
   * The new time.
   * @private {number}
   */
  this.newTime_ = newTime;

  /**
   * The new value.
   * @private {number}
   */
  this.newValue_ = newValue;

  /**
   * The original time before modification.
   * @private {number}
   */
  this.originalTime_ = originalTime;

  /**
   * The original value before modification.
   * @private {number}
   */
  this.originalValue_ = originalValue;
};
goog.inherits(audioCat.state.command.MoveControlPointCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.MoveControlPointCommand.prototype.perform =
    function(project, trackManager) {
  this.controlPoint_.set(this.newTime_, this.newValue_);
};

/** @override */
audioCat.state.command.MoveControlPointCommand.prototype.undo =
    function(project, trackManager) {
  this.controlPoint_.set(this.originalTime_, this.originalValue_);
};

/** @override */
audioCat.state.command.MoveControlPointCommand.prototype.getSummary =
    function(forward) {
  var controlPointString = ' control point';
  return forward ? 'Moved ' + controlPointString + '.' :
      'Put' + controlPointString + ' back.';
};
