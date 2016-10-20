goog.provide('audioCat.state.command.RemoveControlPointCommand');

goog.require('audioCat.state.command.Command');


/**
 * Removes a control point from an envelope.
 * @param {!audioCat.state.envelope.Envelope} envelope The envelope to remove
 *     the control point from.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The track to
 *     remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveControlPointCommand = function(
    envelope,
    controlPoint,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The envelope to remove from.
   * @private {!audioCat.state.envelope.Envelope}
   */
  this.envelope_ = envelope;

  /**
   * The control point to remove.
   * @private {!audioCat.state.envelope.ControlPoint}
   */
  this.controlPoint_ = controlPoint;
};
goog.inherits(audioCat.state.command.RemoveControlPointCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveControlPointCommand.prototype.perform =
    function(project, trackManager) {
  this.envelope_.removeControlPoint(this.controlPoint_);
};

/** @override */
audioCat.state.command.RemoveControlPointCommand.prototype.undo =
    function(project, trackManager) {
  this.envelope_.addControlPoint(this.controlPoint_);
};

/** @override */
audioCat.state.command.RemoveControlPointCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Removed' : 'Un-removed') + ' control point.';
};
