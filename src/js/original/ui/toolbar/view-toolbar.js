goog.provide('audioCat.ui.toolbar.ViewToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.MixerViewItem');


/**
 * A toolbar that lets users manipulate the view of the edito.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.ViewToolbar =
    function(domHelper, editModeManager, actionManager, toolTip) {
  var toolbarItems = [
    new audioCat.ui.toolbar.item.MixerViewItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip)
  ];

  audioCat.ui.toolbar.ViewToolbar.base(
        this, 'constructor', domHelper, editModeManager, toolbarItems);
};
goog.inherits(audioCat.ui.toolbar.ViewToolbar, audioCat.ui.toolbar.Toolbar);
