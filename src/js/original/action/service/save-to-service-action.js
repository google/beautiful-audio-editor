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
goog.provide('audioCat.action.service.SaveToServiceAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('goog.asserts');


/**
 * Saves a project to the current primary service in use. Assumes that the
 * service exists.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages services to
 *     integrate with.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.service.SaveToServiceAction = function(
    domHelper,
    serviceManager,
    dialogManager) {

  /**
   * Manages DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * Integrates with outside services like Google Drive.
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  goog.base(this);
};
goog.inherits(
    audioCat.action.service.SaveToServiceAction, audioCat.action.Action);

/** @override */
audioCat.action.service.SaveToServiceAction.prototype.doAction = function() {
  var service = this.serviceManager_.getPrimaryService();
  // This action assumes an existing primary service we integrated with.
  goog.asserts.assert(service);
  service.saveContent();
};
