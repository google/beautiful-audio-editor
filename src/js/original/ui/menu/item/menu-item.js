goog.provide('audioCat.ui.menu.item.MenuItem');

goog.require('goog.ui.MenuItem');


/**
 * An item in the menu bar.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {audioCat.utility.DomHelper=} opt_domHelper Optional DOM helper used
 *     for document interactions.
 * @param {goog.ui.MenuItemRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
audioCat.ui.menu.item.MenuItem =
    function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.base(this, content, opt_model, opt_domHelper, opt_renderer);
};
goog.inherits(audioCat.ui.menu.item.MenuItem, goog.ui.MenuItem);
