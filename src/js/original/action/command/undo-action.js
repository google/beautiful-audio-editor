goog.provide('audioCat.action.command.UndoAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.message.MessageType');


/**
 * Performs an undo if an undo is allowed. Otherwise, does nothing. Informs the
 * user of the operation after finishing via a message.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.command.UndoAction = function(
    commandManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(audioCat.action.command.UndoAction, audioCat.action.Action);

/** @override */
audioCat.action.command.UndoAction.prototype.doAction = function() {
  if (this.commandManager_.isUndoAllowed()) {
    this.messageManager_.issueMessage(this.commandManager_.dequeueCommand());
  } else {
    this.messageManager_.issueMessage(
        'No command to undo.', audioCat.ui.message.MessageType.DANGER);
  }
};
