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
goog.provide('audioCat.ui.menu.Menu');

goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuSeparator');


/**
 * A menu represents a combo of a button and list of buttons.
 * @param {audioCat.utility.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.MenuRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Menu}
 */
audioCat.ui.menu.Menu = function(opt_domHelper, opt_renderer) {
  goog.base(this, opt_domHelper, opt_renderer);
};
goog.inherits(audioCat.ui.menu.Menu, goog.ui.Menu);


/**
 * Adds an item to the menu.
 * @param {!audioCat.ui.menu.item.MenuItem} item The menu item to add.
 */
audioCat.ui.menu.Menu.prototype.addMenuItem = function(item) {
  this.addChild(item, true);
};

/**
 * Removes an item from the menu.
 * @param {!audioCat.ui.menu.item.MenuItem} item The menu item to remove.
 */
audioCat.ui.menu.Menu.prototype.removeMenuItem = function(item) {
  this.removeChild(item, true);
};

/**
 * Adds a separator to the menu.
 * @return {!goog.ui.MenuSeparator} The newly made separator.
 */
audioCat.ui.menu.Menu.prototype.addSeparator = function() {
  var newSeparator = this.createSeparator();
  this.addChild(newSeparator, true);
  return newSeparator;
};

/**
 * @return {!goog.ui.MenuSeparator} The newly made separator.
 */
audioCat.ui.menu.Menu.prototype.createSeparator = function() {
  return new goog.ui.MenuSeparator();
};
