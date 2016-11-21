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
goog.provide('audioCat.action.OpenLicenseValidatorAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.message.MessageType');
goog.require('goog.asserts');
goog.require('goog.dom.classes');


/**
 * Creates an empty track.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.state.LicenseManager} licenseManager Manages licensing.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.OpenLicenseValidatorAction = function(
    dialogManager,
    messageManager,
    idGenerator,
    domHelper,
    serviceManager,
    licenseManager) {
  goog.base(this);

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  /**
   * @private {!audioCat.state.LicenseManager}
   */
  this.licenseManager_ = licenseManager;
};
goog.inherits(audioCat.action.OpenLicenseValidatorAction,
    audioCat.action.Action);

/** @override */
audioCat.action.OpenLicenseValidatorAction.prototype.doAction = function() {
  goog.asserts.assert(!this.licenseManager_.getRegistered(),
      'We should not register if the user is already registered.');
  var content = this.domHelper_.createDiv(goog.getCssName('topBufferedDialog'));
  var innerContent =
      this.domHelper_.createDiv(goog.getCssName('innerContentWrapper'));
  var warningBox = this.domHelper_.createDiv(goog.getCssName('warningBox'));
  this.domHelper_.appendChild(innerContent, warningBox);
  var instructions =
      this.domHelper_.createDiv(goog.getCssName('innerParagraphContent'));
  this.domHelper_.setRawInnerHtml(instructions,
      'Register by inputting the license you got from the Beautiful Audio ' +
      'Editor website.');
  this.domHelper_.appendChild(innerContent, instructions);
  var licenseArea = this.domHelper_.createElement('textarea');
  this.domHelper_.appendChild(innerContent, licenseArea);
  var registerButton = this.dialogManager_.obtainButton('Register license.');
  var latestTryToRegisterTimeout;
  registerButton.performOnUpPress(goog.bind(function() {
    var licenseKeyToTry = licenseArea.value.trim();
    this.messageManager_.issueMessage('Verifying license ...',
        audioCat.ui.message.MessageType.INFO);
    this.licenseManager_.sendPretendRequest(licenseKeyToTry);
    latestTryToRegisterTimeout = goog.global.setTimeout(goog.bind(function() {
      if (this.licenseManager_.tryToRegister(licenseKeyToTry)) {
        // Successfully registered.
        this.dialogManager_.hideDialog(dialog);
        this.messageManager_.issueMessage('Thank you for registering!',
            audioCat.ui.message.MessageType.SUCCESS);
      } else {
        this.domHelper_.setRawInnerHtml(
            warningBox, 'Invalid license.');
      }
      latestTryToRegisterTimeout = 0;
    }, this), 1300);
  }, this));
  this.domHelper_.appendChild(innerContent, registerButton.getDom());
  this.domHelper_.appendChild(content, innerContent);
  var dialog = this.dialogManager_.obtainDialog(
      content, audioCat.ui.dialog.DialogText.CLOSE);
  dialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
    this.dialogManager_.putBackButton(registerButton);
    if (latestTryToRegisterTimeout) {
      goog.global.clearTimeout(latestTryToRegisterTimeout);
    }
  }, false, this);
  this.dialogManager_.showDialog(dialog);
};
