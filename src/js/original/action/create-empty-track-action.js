goog.provide('audioCat.action.track.CreateEmptyTrackAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.command.CreateEmptyTrackCommand');


/**
 * Creates an empty track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.track.CreateEmptyTrackAction = function(
    idGenerator,
    commandManager) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;
};
goog.inherits(audioCat.action.track.CreateEmptyTrackAction,
    audioCat.action.Action);

/** @override */
audioCat.action.track.CreateEmptyTrackAction.prototype.doAction = function() {
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.CreateEmptyTrackCommand(this.idGenerator_));
};
