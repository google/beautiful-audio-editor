goog.provide('audioCat.ui.toolbar.SignatureToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.SnapToGridItem');
goog.require('audioCat.ui.toolbar.item.TimeScoreItem');


// TODO(chizeng): This probably needs the time domain scale manager since that
// could determine whether we render with beats or with time.

/**
 * Lets the user manage the time signature and tempo.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages how to display audio in the time domain.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.SignatureToolbar = function(
    domHelper,
    editModeManager,
    timeDomainScaleManager,
    commandManager,
    actionManager,
    toolTip) {
  var toolbarItems = [
      new audioCat.ui.toolbar.item.TimeScoreItem(
          domHelper,
          commandManager,
          editModeManager,
          timeDomainScaleManager,
          actionManager,
          toolTip),
      new audioCat.ui.toolbar.item.SnapToGridItem(
          domHelper,
          commandManager,
          editModeManager,
          actionManager,
          toolTip)
    ];
  goog.base(this, domHelper, editModeManager, toolbarItems);
};
goog.inherits(
    audioCat.ui.toolbar.SignatureToolbar, audioCat.ui.toolbar.Toolbar);
