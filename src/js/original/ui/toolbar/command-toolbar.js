goog.provide('audioCat.ui.toolbar.CommandToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.RedoItem');
goog.require('audioCat.ui.toolbar.item.UndoItem');


/**
 * A toolbar that lets users manage commands (undo and redo them for instance).
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history. Executes undos and redos.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.CommandToolbar = function(
    domHelper, editModeManager, commandManager, actionManager, toolTip) {
  var toolbarItems = [
    new audioCat.ui.toolbar.item.UndoItem(
        domHelper, commandManager, editModeManager, actionManager, toolTip),
    new audioCat.ui.toolbar.item.RedoItem(
        domHelper, commandManager, editModeManager, actionManager, toolTip)
  ];

  goog.base(this, domHelper, editModeManager, toolbarItems);
};
goog.inherits(audioCat.ui.toolbar.CommandToolbar, audioCat.ui.toolbar.Toolbar);
