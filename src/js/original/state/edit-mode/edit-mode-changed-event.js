goog.provide('audioCat.state.editMode.EditModeChangedEvent');

goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched when the current mode changes.
 * @param {!audioCat.state.editMode.EditMode} oldMode The previous edit mode.
 * @param {!audioCat.state.editMode.EditMode} newMode The new edit mode.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.editMode.EditModeChangedEvent = function(oldMode, newMode) {
  goog.base(this, audioCat.state.editMode.Events.EDIT_MODE_CHANGED);

  /**
   * The old edit mode.
   * @private {!audioCat.state.editMode.EditMode}
   */
  this.oldMode_ = oldMode;

  /**
   * The new edit mode.
   * @private {!audioCat.state.editMode.EditMode}
   */
  this.newMode_ = newMode;
};
goog.inherits(
    audioCat.state.editMode.EditModeChangedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.editMode.EditMode} The previous edit mode.
 */
audioCat.state.editMode.EditModeChangedEvent.prototype.getPreviousEditMode =
    function() {
  return this.oldMode_;
};

/**
 * @return {!audioCat.state.editMode.EditMode} The new edit mode.
 */
audioCat.state.editMode.EditModeChangedEvent.prototype.getNewEditMode =
    function() {
  return this.newMode_;
};
