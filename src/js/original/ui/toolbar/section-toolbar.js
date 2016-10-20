goog.provide('audioCat.ui.toolbar.SectionToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.DuplicateSectionModeItem');
goog.require('audioCat.ui.toolbar.item.RemoveSectionItem');
goog.require('audioCat.ui.toolbar.item.SelectModeItem');
goog.require('audioCat.ui.toolbar.item.SplitSectionModeItem');


/**
 * A toolbar that lets users manipulate sections.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.SectionToolbar =
    function(domHelper, editModeManager, actionManager, toolTip) {
  var toolbarItems = [
    new audioCat.ui.toolbar.item.SelectModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.DuplicateSectionModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.SplitSectionModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.RemoveSectionItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip)
  ];

  goog.base(this, domHelper, editModeManager, toolbarItems);
};
goog.inherits(audioCat.ui.toolbar.SectionToolbar, audioCat.ui.toolbar.Toolbar);
