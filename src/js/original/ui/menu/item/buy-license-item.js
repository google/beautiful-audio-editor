goog.provide('audioCat.ui.menu.item.BuyLicenseItem');

goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');
goog.require('goog.window');


/**
 * The menu item that opens a window for buying a license
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.BuyLicenseItem = function(domHelper) {
  goog.base(this, 'Buy a license.');

  // Deactivate menu item if necessary.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(
    audioCat.ui.menu.item.BuyLicenseItem, audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.BuyLicenseItem.prototype.handleClick_ = function() {
  goog.window.open('/buy');
};
