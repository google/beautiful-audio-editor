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
