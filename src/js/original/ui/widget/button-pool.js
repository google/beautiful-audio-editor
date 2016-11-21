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
goog.provide('audioCat.ui.widget.ButtonPool');

goog.require('audioCat.ui.widget.ButtonWidget');


/**
 * Pools buttons so that we don't create too many.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 */
audioCat.ui.widget.ButtonPool = function(domHelper) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * A stack of buttons.
   * @private {!Array.<!audioCat.ui.widget.ButtonWidget>}
   */
  this.buttonWidgets_ = [];
};

/**
 * Retrieves a button. Creates a new one if necessary.
 * @param {string|!Element} content The content for the button.
 * @return {!audioCat.ui.widget.ButtonWidget} A button.
 */
audioCat.ui.widget.ButtonPool.prototype.retrieveButton = function(content) {
  if (this.getSize()) {
    var button = this.buttonWidgets_.pop();
    button.setContent(content);
  }
  return new audioCat.ui.widget.ButtonWidget(this.domHelper_, content);
};

/**
 * Puts a button back into the pool. Removes it from the DOM, and resets it.
 * Also removes any listeners on the button.
 * @param {!audioCat.ui.widget.ButtonWidget} button The button to put back.
 */
audioCat.ui.widget.ButtonPool.prototype.putBackButton = function(button) {
  this.domHelper_.removeNode(button.getDom());
  button.resetClasses();
  button.clearUpPressCallback();
  this.buttonWidgets_.push(button);
};

/**
 * @return {number} The number of buttons pooled.
 */
audioCat.ui.widget.ButtonPool.prototype.getSize = function() {
  return this.buttonWidgets_.length;
};
