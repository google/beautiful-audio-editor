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
goog.provide('audioCat.action.CheckForGenericSaveNeededAction');

goog.require('audioCat.action.Action');


/**
 * Checks for whether a save is needed for some reason (integrated service?).
 * Warns the user if not.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.state.SaveChecker} saveChecker Checks to see if we saved
 *     all changes at any moment.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.CheckForGenericSaveNeededAction = function(
    domHelper,
    serviceManager,
    saveChecker) {
  goog.base(this);

  /**
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  /**
   * @private {!audioCat.state.SaveChecker}
   */
  this.saveChecker_ = saveChecker;
};
goog.inherits(
    audioCat.action.CheckForGenericSaveNeededAction, audioCat.action.Action);

/** @override */
audioCat.action.CheckForGenericSaveNeededAction.prototype.doAction =
    function() {
  goog.global.window.onbeforeunload =
      goog.bind(this.handleWindowClose_, this);
};

/**
 * Handles what happens when the user tries to close the window.
 * @return {string|undefined} If a string is returned, the browser will display
 *     popup verifying whether the user really intends to leave the page.
 * @private
 */
audioCat.action.CheckForGenericSaveNeededAction.prototype.handleWindowClose_ =
    function() {
  if (this.saveChecker_.checkForOutstandingChanges()) {
    // A save is needed for some reason.
    var service = this.serviceManager_.getPrimaryService();
    var message =
        'Are you sure you want to quit? You will lose pending changes. ';
    message += ' Stay on this page to stop quitting so you can ';
    if (service) {
      message += 'save to ' + service.getServiceName();
    } else {
      message += 'download the project to a local file';
    }
    message += ' first. Otherwise, leave or reload this page to discard ' +
        'pending changes.';
    return message;
  }
};
