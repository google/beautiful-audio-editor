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
goog.provide('audioCat.ui.dialog.Contentable');
goog.provide('audioCat.ui.dialog.DialogWidget');

goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.dialog.templates');
goog.require('audioCat.ui.widget.Widget');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom.classes');
goog.require('soy');


/** @typedef {string|!Element} */
audioCat.ui.dialog.Contentable;


/**
 * A widget for a generic dialog box.
 * @param {!audioCat.ui.widget.ButtonPool} buttonPool Pools buttons so that we
 *     don't create too many and can reuse buttons.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.dialog.Contentable} mainContent The main content for the
 *     dialog.
 * @param {?audioCat.ui.dialog.DialogText=} opt_closeText If provided, the
 *     dialog will include a button for closing the dialog. The text of the
 *     button will be this argument. Excluding this argument prevents the dialog
 *     from having such a button.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.dialog.DialogWidget =
    function(buttonPool, domHelper, mainContent, opt_closeText) {

  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Pools buttons.
   * @private {!audioCat.ui.widget.ButtonPool}
   */
  this.buttonPool_ = buttonPool;

  /**
   * The button for canceling the dialog. Or null if that doesn't exist.
   * @private {audioCat.ui.widget.ButtonWidget}
   */
  this.cancelButton_ = null;

  var outerWrapper = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.dialog.templates.Dialog));
  goog.base(this, outerWrapper);

  /**
   * The inner wrapping for the dialog.
   * @private {!Element}
   */
  this.innerWrapper_ = domHelper.getElementByClassForSure(
      goog.getCssName('dialogInnerWrapper'), outerWrapper);

  /**
   * Directly wraps the content specified by the caller.
   * @private {!Element}
   */
  this.innerContentWrapper_ = domHelper.createDiv(
      goog.getCssName('innerContentWrapper'));
  domHelper.appendChild(this.innerWrapper_, this.innerContentWrapper_);

  /**
   * Whether this dialog was shown with a background shield, which prevents the
   * user from interating with UI elements while the dialog is showing. This
   * boolean is used by the dialog manager to decide when to hide the
   * background shield.
   * @private {boolean}
   */
  this.shownWithBackgroundShield_ = false;

  // Add a cancel button if need be, and set the content of the dialog.
  var dialogContent = mainContent;
  if (opt_closeText && goog.isString(mainContent)) {
    // We have a cancel button and string content. Add some top padding to
    // make room for the button. If the content is an element, it likely
    // already handles this padding, so we don't add extra padding.
    dialogContent =
        domHelper.createDiv(goog.getCssName('topBufferedDialog'));
    var innerContent =
        domHelper.createDiv(goog.getCssName('innerContentWrapper'));
    domHelper.setRawInnerHtml(innerContent, mainContent);
    domHelper.appendChild(dialogContent, innerContent);
  }
  this.setContent(dialogContent);
  this.setCloseText(opt_closeText);
};
goog.inherits(audioCat.ui.dialog.DialogWidget, audioCat.ui.widget.Widget);

/**
 * Sets the text displayed in the button for closing the dialog. If not
 * provided, then the dialog is not closeable via this button.
 * @param {?audioCat.ui.dialog.DialogText=} opt_closeText The text to display
 *     in the close button or some falsy value to hide this button.
 */
audioCat.ui.dialog.DialogWidget.prototype.setCloseText =
    function(opt_closeText) {
  if (opt_closeText) {
    var cancelButton = this.buttonPool_.retrieveButton(opt_closeText);
    goog.dom.classes.add(
        cancelButton.getDom(), goog.getCssName('dialogCancelButton'));
    cancelButton.performOnUpPress(goog.bind(this.handleCancelClicked_, this));
    this.domHelper_.appendChild(this.innerWrapper_, cancelButton.getDom());
    this.cancelButton_ = cancelButton;
  } else {
    var cancelButton = this.cancelButton_;
    if (cancelButton) {
      this.buttonPool_.putBackButton(cancelButton);
      this.cancelButton_ = null;
    }
  }
};

/**
 * Handles what happens when the cancel button is clicked (if it exists).
 * @private
 */
audioCat.ui.dialog.DialogWidget.prototype.handleCancelClicked_ = function() {
  // Request to be cleaned up and hidden.
  this.dispatchEvent(audioCat.ui.dialog.EventType.HIDE_DIALOG_REQUESTED);
};

/**
 * Notifies other objects that this dialog is about to be hidden.
 */
audioCat.ui.dialog.DialogWidget.prototype.noteBeingHidden = function() {
  this.dispatchEvent(audioCat.ui.dialog.EventType.BEFORE_HIDDEN);
};

/**
 * @return {boolean} Whether the dialog can be canceled.
 */
audioCat.ui.dialog.DialogWidget.prototype.isCancelable = function() {
  return !!(this.cancelButton_);
};

/**
 * Sets the content of the dialog.
 * @param {?audioCat.ui.dialog.Contentable=} content The content to set. If null
 * or undefined, or otherwise falsy, removes any content.
 */
audioCat.ui.dialog.DialogWidget.prototype.setContent = function(content) {
  var domHelper = this.domHelper_;
  var innerContentWrapper = this.innerContentWrapper_;
  if (!content) {
    // Clear content.
    domHelper.removeChildren(innerContentWrapper);
  } else if (content instanceof String || typeof content == 'string') {
    if (this.cancelButton_) {
      // The content is a string. Ensure we have top padding for CLOSE button.
      var mainDialogContent =
          domHelper.createDiv(goog.getCssName('topBufferedDialog'));
      var innerContent =
          domHelper.createDiv(goog.getCssName('innerContentWrapper'));
      domHelper.setRawInnerHtml(innerContent, content);
      domHelper.appendChild(mainDialogContent, innerContent);
      domHelper.appendChild(innerContentWrapper, mainDialogContent);
    } else {
      // No close button. Just set the dialog content to the text.
      domHelper.setRawInnerHtml(innerContentWrapper, content);
    }
  } else {
    // The content is a DOM node.
    domHelper.removeChildren(innerContentWrapper);
    domHelper.appendChild(
        innerContentWrapper, /** @type {!Element} */ (content));
  }
};

/**
 * Sets whether this dialog was shown with a background shield. The dialog
 * manager uses this property to maintain its count of background-shielded
 * dialogs so that it knows when to hide the background shield, which prevents
 * the user from interacting with background elements.
 * @param {boolean} value The value.
 */
audioCat.ui.dialog.DialogWidget.prototype.setShownWithBackgroundShield =
    function(value) {
  this.shownWithBackgroundShield_ = value;
};

/**
 * @return {boolean} Whether this dialog was shown with a background shield.
 */
audioCat.ui.dialog.DialogWidget.prototype.getShownWithBackgroundShield =
    function() {
  return this.shownWithBackgroundShield_;
};

/**
 * @return {!Element} The inner element for the dialog.
 */
audioCat.ui.dialog.DialogWidget.prototype.getInnerDom = function() {
  return this.innerWrapper_;
};
