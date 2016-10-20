goog.provide('audioCat.ui.toolbar.item.RemoveSectionItem');

goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');


/**
 * A toolbar item for entering a mode in which users can delete sections.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.RemoveSectionItem =
    function(domHelper, editModeManager, actionManager, toolTip) {
  var label = 'Enter remove section mode.';
  var description = label + ' After entering this mode, delete a section of ' +
      'audio by clicking on it.'; 
  goog.base(this, domHelper, editModeManager, actionManager, toolTip, label,
      audioCat.state.editMode.EditModeName.REMOVE_SECTION, undefined,
      description);

  domHelper.listenForUpPress(
      this.getDom(), this.maybeSwitchEditMode, false, this);
};
goog.inherits(
    audioCat.ui.toolbar.item.RemoveSectionItem, audioCat.ui.toolbar.item.Item);

/** @override */
audioCat.ui.toolbar.item.RemoveSectionItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/removeSectionMode.svg');
};
