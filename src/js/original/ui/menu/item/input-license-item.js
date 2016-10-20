goog.provide('audioCat.ui.menu.item.InputLicenseItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item that lets the user input a license.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.InputLicenseItem = function(
    domHelper, actionManager) {
  goog.base(this, 'Input a license.');

  /**
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  // Deactivate menu item if necessary.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(
    audioCat.ui.menu.item.InputLicenseItem, audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.InputLicenseItem.prototype.handleClick_ = function() {
  this.actionManager_.retrieveAction(
      audioCat.action.ActionType.OPEN_LICENSE_VALIDATOR).doAction();
};
