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
goog.provide('audioCat.ui.menu.button.RegisterLicenseButton');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('audioCat.ui.menu.item.BuyLicenseItem');
goog.require('audioCat.ui.menu.item.InputLicenseItem');
goog.require('goog.asserts');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component.EventType');


/**
 * Top-level file button on the menu bar.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.state.LicenseManager} licenseManager Manages licensing.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.RegisterLicenseButton = function(
    domHelper,
    actionManager,
    serviceManager,
    licenseManager) {
  // Populate the menu with items.
  var menu = new audioCat.ui.menu.Menu();

  // Button for opening a new window letting the user buy a license.
  menu.addMenuItem(new audioCat.ui.menu.item.BuyLicenseItem(domHelper));

  // Button that lets the user input a license.
  menu.addMenuItem(
      new audioCat.ui.menu.item.InputLicenseItem(domHelper, actionManager));

  goog.base(this, 'Buy/input a license.', menu);
};
goog.inherits(audioCat.ui.menu.button.RegisterLicenseButton,
    audioCat.ui.menu.button.MenuButton);

