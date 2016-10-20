goog.provide('audioCat.action.command.UndoRedoAction');

goog.require('audioCat.action.Action');


/**
 * Performs either an undo or a redo. May instigate an exception if the current
 * state does not allow for undo or redo. After performing the redo or undo,
 * displays a message to the user communicating what just happened.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.command.UndoRedoAction = function(
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

  /**
   * If true, calling doAction on this action will perform a redo. Otherwise,
   * calling doAction will perform an undo.
   * @private {boolean}
   */
  this.forwardDirection_ = false;
};
goog.inherits(audioCat.action.command.UndoRedoAction, audioCat.action.Action);

/**
 * Sets whether the next doAction should perform a redo or an undo. If true,
 * performs a redo. If false, performs an undo. Initially false.
 * @param {boolean} forwardDirection Whether we should perform a command in the
 *     forward direction (ie, redo).
 */
audioCat.action.command.UndoRedoAction.prototype.setForwardDirectionState =
    function(forwardDirection) {
  this.forwardDirection_ = forwardDirection;
};

/** @override */
audioCat.action.command.UndoRedoAction.prototype.doAction = function() {
  this.messageManager_.issueMessage(this.forwardDirection_ ?
      this.commandManager_.redoCommand() :
      this.commandManager_.dequeueCommand());
};
