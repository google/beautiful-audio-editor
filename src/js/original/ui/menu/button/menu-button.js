goog.provide('audioCat.ui.menu.button.MenuButton');

goog.require('goog.ui.MenuButton');


/**
 * A top-level menu button.
 * @param {goog.ui.ControlContent=} opt_content Text caption or existing DOM
 *     structure to display as the button's caption (if any).
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu button; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
audioCat.ui.menu.button.MenuButton = function(opt_content, opt_menu,
    opt_renderer, opt_domHelper, opt_menuRenderer) {
  goog.base(this, opt_content, opt_menu, opt_renderer,
      opt_domHelper, opt_menuRenderer);
};
goog.inherits(audioCat.ui.menu.button.MenuButton, goog.ui.MenuButton);

/** @override */
audioCat.ui.menu.button.MenuButton.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
