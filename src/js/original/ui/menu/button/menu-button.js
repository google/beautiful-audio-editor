/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
