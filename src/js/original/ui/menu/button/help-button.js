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
