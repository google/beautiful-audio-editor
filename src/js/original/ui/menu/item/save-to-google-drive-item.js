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
goog.provide('audioCat.ui.menu.item.SaveToGoogleDriveItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.service.EventType');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for encoding the project for storing locally.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.service.Service} service The current service.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.SaveToGoogleDriveItem =
    function(domHelper, actionManager, service) {
  goog.base(this, 'Save project to ' + service.getServiceName() + '.');

  /**
   * A list of listener keys to unlisten later.
   * @private {!Array.<goog.events.Key>}
   */
  this.listenerKeys_ = [];

  // Enable / disable this item based on whether we should save the document.
  this.listenerKeys_.push(goog.events.listen(service,
      audioCat.service.EventType.SHOULD_SAVE_STATE_CHANGED,
      function() {
        this.setEnabled(service.getSaveNeeded());
      }, false, this));

  // Respond to clicks.
  var action = actionManager.retrieveAction(
      audioCat.action.ActionType.SAVE_TO_SERVICE);
  this.listenerKeys_.push(goog.events.listen(
      this, goog.ui.Component.EventType.ACTION,
      action.doAction, false, action));
};
goog.inherits(audioCat.ui.menu.item.SaveToGoogleDriveItem,
    audioCat.ui.menu.item.MenuItem);

/** @override */
audioCat.ui.menu.item.SaveToGoogleDriveItem.prototype.disposeInternal =
    function() {
  goog.base(this, 'disposeInternal');
  for (var i = 0; i < this.listenerKeys_.length; ++i) {
    goog.events.unlistenByKey(this.listenerKeys_[i]);
  }
};
