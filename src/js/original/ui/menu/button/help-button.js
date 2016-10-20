goog.provide('audioCat.ui.menu.button.HelpButton');

goog.require('audioCat.service.EventType');
goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('audioCat.ui.menu.item.ShowDocumentationItem');
goog.require('goog.asserts');


/**
 * Top-level file button on the menu bar.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.HelpButton = function(
    domHelper,
    actionManager) {

  // Populate the menu with items.
  var menu = new audioCat.ui.menu.Menu();

  // Populate the items related to saving local projects.
  menu.addMenuItem(new audioCat.ui.menu.item.ShowDocumentationItem(
      domHelper, actionManager));

  goog.base(this, 'Help', menu);
};
goog.inherits(
    audioCat.ui.menu.button.HelpButton, audioCat.ui.menu.button.MenuButton);
