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
goog.provide('audioCat.utility.dialog.DialogManager');

goog.require('audioCat.ui.dialog.DialogPool');
goog.require('audioCat.ui.dialog.EventType');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Manages the display of dialogs.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Keeps
 *     tracks of window dimensions and scroll.
 * @param {!audioCat.ui.widget.ButtonPool} buttonPool Pools buttons so that we
 *     don't create too many and can reuse buttons.
 * @constructor
 */
audioCat.utility.dialog.DialogManager =
    function(domHelper, scrollResizeManager, buttonPool) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Keeps track of window dimensions and scroll.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Pools buttons so we don't create too many.
   * @private {!audioCat.ui.widget.ButtonPool}
   */
  this.buttonPool_ = buttonPool;

  /**
   * Ensures we don't create too many dialog objects.
   * @private {!audioCat.ui.dialog.DialogPool}
   */
  this.dialogPool_ = new audioCat.ui.dialog.DialogPool(domHelper, buttonPool);

  /**
   * The element shielding the user from interacting with background elements if
   * the shield is on. Otherwise, null.
   * @private {Element}
   */
  this.backgroundShield_ = null;

  /**
   * The current count of background-shielded dialogs. We can hide the
   * background shield when this value drops to 0.
   * @private {number}
   */
  this.backgroundShieldedDialogCount_ = 0;

  // If we have a background shield, resize it along with the window.
  scrollResizeManager.callAfterScroll(goog.bind(this.handleResize_, this));
};

/**
 * Handles what happens when the user resizes the window. Notably, resizes the
 * shield preventing the user from interacting with the background.
 * @param {number} xScroll The left/right scroll.
 * @param {number} yScroll The top/bottom scroll.
 * @param {number} windowWidth The window width.
 * @param {number} windowHeight The window height.
 * @private
 */
audioCat.utility.dialog.DialogManager.prototype.handleResize_ =
    function(xScroll, yScroll, windowWidth, windowHeight) {
  var backgroundShield = this.backgroundShield_;
  if (!backgroundShield) {
    return;
  }
  backgroundShield.style.width = String(windowWidth) + 'px';
  backgroundShield.style.height = String(windowHeight) + 'px';
};

/**
 * Retrieves a button that was reset from the pool.
 * @param {!audioCat.ui.dialog.Contentable} content The content for the button.
 * @return {!audioCat.ui.widget.ButtonWidget} A button widget that was reset.
 */
audioCat.utility.dialog.DialogManager.prototype.obtainButton =
    function(content) {
  return this.buttonPool_.retrieveButton(content);
};

/**
 * Puts a button back into the pool.
 * @param {!audioCat.ui.widget.ButtonWidget} button The button to put back.
 */
audioCat.utility.dialog.DialogManager.prototype.putBackButton =
    function(button) {
  this.buttonPool_.putBackButton(button);
};

/**
 * Retrieves a customized dialog.
 * @param {!audioCat.ui.dialog.Contentable} content The dialog content.
 * @param {?audioCat.ui.dialog.DialogText=} opt_closeText If provided and
 *     true-y, the dialog includes a button for closing the dialog. The text of
 *     this button will be this argument.
 * @return {!audioCat.ui.dialog.DialogWidget} A dialog box.
 */
audioCat.utility.dialog.DialogManager.prototype.obtainDialog =
    function(content, opt_closeText) {
  var dialogWidget = this.dialogPool_.retrieveDialog(content, opt_closeText);

  // Hide the dialog if the dialog requests hiding.
  goog.events.listenOnce(dialogWidget,
      audioCat.ui.dialog.EventType.HIDE_DIALOG_REQUESTED,
      this.handleHideDialogRequested_, false, this);
  return dialogWidget;
};

/**
 * Handles what happens when a dialog requests to be hidden.
 * @param {!goog.events.Event} event The associated event dispatched by the
 *     dialog widget.
 * @private
 */
audioCat.utility.dialog.DialogManager.prototype.handleHideDialogRequested_ =
    function(event) {
  this.hideDialog(
      /** @type {!audioCat.ui.dialog.DialogWidget} */ (event.target));
};

/**
 * Shows a given dialog.
 * @param {!audioCat.ui.dialog.DialogWidget} dialogWidget The dialog to show.
 * @param {boolean=} opt_allowBackgroundInteractions Whether to allow the user
 *     to interact with the background when the dialog shows. Defaults to false.
 */
audioCat.utility.dialog.DialogManager.prototype.showDialog = function(
    dialogWidget, opt_allowBackgroundInteractions) {
  // Hide the dialog.
  var domHelper = this.domHelper_;

  // Create a background shield to prevent users from interacting with other
  // elements.
  var documentBody = domHelper.getDocument().body;
  if (!opt_allowBackgroundInteractions) {
    if (!this.backgroundShield_) {
      // If nothing shielding the background, make and display one.
      var shield = domHelper.createDiv(goog.getCssName('backgroundShield'));

      // Make the shield block the whole screen.
      // TODO(chizeng): Alter dimensions of the shield when window resizes.
      var scrollResizeManager = this.scrollResizeManager_;
      shield.style.width = String(scrollResizeManager.getWindowWidth()) + 'px';
      shield.style.height =
          String(scrollResizeManager.getWindowHeight()) + 'px';
      this.backgroundShield_ = shield;
      domHelper.appendChild(documentBody, shield);
    }

    dialogWidget.setShownWithBackgroundShield(true);
    this.backgroundShieldedDialogCount_++;
  }
  var dialogDom = dialogWidget.getDom();
  domHelper.appendChild(documentBody, dialogWidget.getDom());
};

/**
 * Hides a dialog, and puts the dialog back for later use.
 * @param {!audioCat.ui.dialog.DialogWidget} dialog The dialog to hide.
 */
audioCat.utility.dialog.DialogManager.prototype.hideDialog =
    function(dialog) {
  // Hide the dialog.
  var domHelper = this.domHelper_;
  var shownWithBackgroundShield = dialog.getShownWithBackgroundShield();

  // The shown with background shield property is reset by this call, so we have
  // to store its current value before reseting.
  dialog.noteBeingHidden();
  this.dialogPool_.putBackDialog(dialog);

  if (shownWithBackgroundShield) {
    this.backgroundShieldedDialogCount_--;
    if (this.backgroundShieldedDialogCount_ == 0) {
      // Hide the shield that prevents interactions with the background.
      domHelper.removeNode(this.backgroundShield_);
      this.backgroundShield_ = null;
    }
  }
};
