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
goog.provide('audioCat.action.encode.ActuateProjectStateAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('goog.asserts');
goog.require('goog.dom.classes');


/**
 * An action that takes a binary blob encoding of a project and actuates it -
 * overriding existing content and making the new project state the encoded one.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.encode.ActuateProjectStateAction = function(
    supportDetector,
    dialogManager,
    statePlanManager,
    domHelper) {
  goog.base(this);

  /**
   * @private {!audioCat.state.StatePlanManager}
   */
  this.statePlanManager_ = statePlanManager;

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The name of the project file to import. Null if no encoding process is
   * happening now.
   * @private {string?}
   */
  this.projectName_ = null;

  /**
   * The blob that is about to be encoded. May be null if no encoding process is
   * happening now.
   * @private {ArrayBuffer}
   */
  this.encoding_ = null;
};
goog.inherits(audioCat.action.encode.ActuateProjectStateAction,
    audioCat.action.Action);

/**
 * Sets the name of the project file to import. Must be called before each call
 * to this action being done. Null to clear.
 * @param {string?} projectName The name of the project file.
 */
audioCat.action.encode.ActuateProjectStateAction.prototype.setFileName =
    function(projectName) {
  this.projectName_ = projectName;
};

/**
 * Sets the encoding about to be actuated. Must be called before each call to
 * this action being done. Null to clear.
 * @param {ArrayBuffer} encoding The encoding.
 */
audioCat.action.encode.ActuateProjectStateAction.prototype.setEncoding =
    function(encoding) {
  this.encoding_ = encoding;
};

/**
 * Makes the project reflect the encoding of the project state, overriding any
 * current content. After that, nulls out the current encoding remembered by
 * this action.
 * @override
 */
audioCat.action.encode.ActuateProjectStateAction.prototype.doAction =
    function() {
  goog.asserts.assert(!goog.isNull(this.encoding_));
  goog.asserts.assert(!goog.isNull(this.projectName_));
  var domHelper = this.domHelper_;
  var dialogManager = this.dialogManager_;
  var waitContent = domHelper.createDiv();
  var innerContent = domHelper.createDiv(
      goog.getCssName('innerContentWrapper'));
  domHelper.setTextContent(
      innerContent, 'Loading ' + this.projectName_ + ' ...');
  domHelper.appendChild(waitContent, innerContent);
  var waitDialog = dialogManager.obtainDialog(waitContent);

  var issueDecodingError = function(errorMessage) {
    // Issues a decoding error message.
    goog.asserts.assert(!goog.isNull(this.projectName_));
    var errorContent =
        domHelper.createDiv(goog.getCssName('topBufferedDialog'));
    var innerErrorContent = domHelper.createDiv(
        goog.getCssName('innerContentWrapper'));
    goog.dom.classes.add(innerErrorContent, goog.getCssName('warningBox'));
    errorMessage = 'Error loading ' + this.projectName_ + ': ' + errorMessage;
    domHelper.setTextContent(innerErrorContent, errorMessage);
    domHelper.appendChild(errorContent, innerErrorContent);
    var errorDialog = dialogManager.obtainDialog(
        errorContent, audioCat.ui.dialog.DialogText.CLOSE);
    dialogManager.showDialog(errorDialog);
  };

  goog.global.setTimeout(function() {
    // Asynchronously show the dialog to avoid being blocked by the main thread.
    dialogManager.showDialog(waitDialog);
  }, 1);

  // When loading the project terminates for whatever reason, handle it.
  this.statePlanManager_.listenOnce(audioCat.state.events.DECODING_ENDED,
      function(e) {
    e = /** @type {!audioCat.state.DecodingEndedEvent} */ (e);
    var error = e.getError();
    if (error.length) {
      issueDecodingError(error);
    }

    // Unset values relevant to the previous decoding.
    this.projectName_ = null;
    this.encoding_ = null;

    goog.global.setTimeout(function() {
      // Hide the dialog.
      // Use a time out so it happens after the previous timeout.
      dialogManager.hideDialog(waitDialog);
    }, 2);
  }, false, this);
  this.statePlanManager_.decode(this.encoding_);
};
