goog.provide('audioCat.ui.menu.item.RedoItem');

goog.require('audioCat.state.command.Event');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for redo-ing a command.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Executes and
 *     manages commands. Allows for undo and redo.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.RedoItem =
    function(domHelper, commandManager) {
  goog.base(this, 'Redo');

  /**
   * Manages command history.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  // Deactivate menu item if necessary.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);

  this.setEnabledState_();
  // If command history changes (ie, undos, redos performed), update enabled
  // state.
  goog.events.listen(commandManager,
      audioCat.state.command.Event.COMMAND_HISTORY_CHANGED,
          this.setEnabledState_, false, this);
};
goog.inherits(audioCat.ui.menu.item.RedoItem, audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.RedoItem.prototype.handleClick_ = function() {
  this.commandManager_.redoCommand();
};

/**
 * Enables or disables the state of the item based on whether we can undo now.
 * @private
 */
audioCat.ui.menu.item.RedoItem.prototype.setEnabledState_ = function() {
  this.setEnabled(this.commandManager_.isRedoAllowed());
};
