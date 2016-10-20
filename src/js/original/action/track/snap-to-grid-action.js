goog.provide('audioCat.action.track.SnapToGridAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.editMode.EditModeName');


/**
 * Toggles snapping to grid while moving sections.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.track.SnapToGridAction = function(
    editModeManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(audioCat.action.track.SnapToGridAction, audioCat.action.Action);

/** @override */
audioCat.action.track.SnapToGridAction.prototype.doAction = function() {
  var mode = /** @type {!audioCat.state.editMode.SelectEditMode} */(
      this.editModeManager_.getEditModeByName(
          audioCat.state.editMode.EditModeName.SELECT));
  var newSnapToGridState = !mode.getSnapToGridState();
  mode.setSnapToGridState(newSnapToGridState);
  this.messageManager_.issueMessage(newSnapToGridState ?
      'Now, sections will snap to grid upon move.' :
      'Snap to grid turned off.');
};
