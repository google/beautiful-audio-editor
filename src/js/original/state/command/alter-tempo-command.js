goog.provide('audioCat.state.command.AlterTempoCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the tempo of the project.
 * @param {!audioCat.audio.SignatureTempoManager} signatureTempoManager Manages
 *     the tempo of the project.
 * @param {number} previousTempo The tempo before this command.
 * @param {number} newTempo The new tempo after this command.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterTempoCommand =
    function(signatureTempoManager, previousTempo, newTempo, idGenerator) {
  // TODO(chizeng): Notify user which track was updated via a track index.
  goog.base(this, idGenerator, true);

  /**
   * Manages the current time signature and tempo.
   * @private {!audioCat.audio.SignatureTempoManager}
   */
  this.signatureTempoManager_ = signatureTempoManager;

  /**
   * The previous tempo.
   * @private {number}
   */
  this.previousTempo_ = previousTempo;

  /**
   * The new tempo this command sets.
   * @private {number}
   */
  this.newTempo_ = newTempo;
};
goog.inherits(audioCat.state.command.AlterTempoCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterTempoCommand.prototype.perform =
    function(project, trackManager) {
  this.signatureTempoManager_.setTempo(this.newTempo_);
};

/** @override */
audioCat.state.command.AlterTempoCommand.prototype.undo =
    function(project, trackManager) {
  this.signatureTempoManager_.setTempo(this.previousTempo_);
};

/** @override */
audioCat.state.command.AlterTempoCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'Set tempo to ' + this.newTempo_ :
      'Set tempo back to ' + this.previousTempo_) + '.';
};
