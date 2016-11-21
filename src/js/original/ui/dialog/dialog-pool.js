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
goog.provide('audioCat.ui.dialog.DialogPool');

goog.require('audioCat.ui.dialog.DialogWidget');
goog.require('goog.dom.classes');


/**
 * Pools dialogs so that we don't keep recreating them. Creates new dialogs only
 * if necessary.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.widget.ButtonPool} buttonPool Pools buttons so that we
 *     don't create too many and can reuse buttons.
 * @constructor
 */
audioCat.ui.dialog.DialogPool = function(domHelper, buttonPool) {
  /**
   * A stack of dialogs to cycle through.
   * @private {!Array.<!audioCat.ui.dialog.DialogWidget>}
   */
  this.dialogs_ = [];

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
   * Whether the pool is in a mode in which new dialogs are always created. This
   * means no pooling. This saves memory, might not be fast.
   * @private {boolean}
   */
  this.alwaysCreateNewDialogs_ = true;
};

/**
 * Puts a dialog back into the pool. Removes the dialog from the DOM, and resets
 * it as well.
 * @param {!audioCat.ui.dialog.DialogWidget} dialog The dialog to return.
 */
audioCat.ui.dialog.DialogPool.prototype.putBackDialog = function(dialog) {
  dialog.setContent(); // Clears the content.
  var dialogDom = dialog.getDom();

  this.domHelper_.removeNode(dialogDom);

  // This gets rid of the dialog's cancel button if there is any.
  dialog.setCloseText();

  dialog.setShownWithBackgroundShield(false);
  dialogDom.className = goog.getCssName('dialogOuterWrapper');

  if (this.alwaysCreateNewDialogs_) {
    dialog.cleanUp();
  } else {
    // Do not store dialogs if we put them back.
    this.dialogs_.push(dialog);
  }
};

/**
 * Retrieves a dialog from the pool. Creates a new one if the pool is empty.
 * @param {!audioCat.ui.dialog.Contentable} content The content. Either a string
 *     or a DOM element.
 * @param {?audioCat.ui.dialog.DialogText=} opt_closeText If provided and
 *     true-y, the dialog includes a button for closing the dialog. The text of
 *     this button will be this argument.
 * @return {!audioCat.ui.dialog.DialogWidget} A dialog.
 */
audioCat.ui.dialog.DialogPool.prototype.retrieveDialog =
    function(content, opt_closeText) {
  if (!this.alwaysCreateNewDialogs_ && this.getSize()) {
    var dialog = this.dialogs_.pop();
    if (!!opt_closeText != dialog.isCancelable()) {
      dialog.setCloseText(opt_closeText);
    }
    dialog.setContent(content);
    return dialog;
  }
  return new audioCat.ui.dialog.DialogWidget(
      this.buttonPool_, this.domHelper_, content, opt_closeText);
};

/**
 * @return {number} The size of the pool.
 */
audioCat.ui.dialog.DialogPool.prototype.getSize = function() {
  return this.dialogs_.length;
};
