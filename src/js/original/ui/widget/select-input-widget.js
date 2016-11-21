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
goog.provide('audioCat.ui.widget.SelectInputWidget');

goog.require('audioCat.ui.widget.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');

/**
 * @typedef {{
 *   k: string,
 *   v: string
 * }}
 */
var OptionEntry;


/**
 * A widget for altering a select menu.
 * @param {!audioCat.utility.DomHelper} domHelper Interacts with the DOM.
 * @param {string} description A string to accompany the selection.
 * @param {!Array.<!OptionEntry>} choices An array of choices, each
 *     having a key (k) and value (v).
 * @param {number} initialIndex The index of the initial value.
 * @param {string=} opt_additionalClassName An additional class name to give the
 *     whole widget.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.SelectInputWidget = function(
    domHelper, description, choices, initialIndex, opt_additionalClassName) {
  var container = domHelper.createDiv(goog.getCssName('inputDeviceWidget'));
  if (opt_additionalClassName) {
    goog.dom.classes.add(container, opt_additionalClassName);
  }
  audioCat.ui.widget.SelectInputWidget.base(this, 'constructor', container);

  /**
   * Choices for the selection widget.
   * @private {!Array.<!OptionEntry>}
   */
  this.choices_ = choices;

  /**
   * The index of the current value.
   * @private {number}
   */
  this.currentIndex_ = initialIndex;

  // Wrap the description.
  var descriptionWrapper = domHelper.createDiv(
      goog.getCssName('selectionDescriptionWrapper'));
  domHelper.setRawInnerHtml(descriptionWrapper, description);
  domHelper.appendChild(container, descriptionWrapper);

  // Wrap the select input element.
  var selectInput = domHelper.createElement('select');
  for (var i = 0; i < choices.length; ++i) {
    var optionElement = domHelper.createElement('option');
    domHelper.setRawInnerHtml(optionElement, choices[i].v);
    domHelper.appendChild(selectInput, optionElement);
  }
  var selectionInputWrapper = domHelper.createDiv(
      goog.getCssName('selectionInputWrapper'));
  domHelper.appendChild(selectionInputWrapper, selectInput);
  domHelper.appendChild(container, selectionInputWrapper);

  // Dispatch our own event if the selection changes.

  /**
   * The key for the listener on the checkbox.
   * @private {number|goog.events.ListenableKey}
   */
  this.rawInputListenerKey_ = goog.events.listen(
      selectInput, 'change', this.handleInputChanged_, false, this);
};
goog.inherits(
    audioCat.ui.widget.SelectInputWidget, audioCat.ui.widget.Widget);

/**
 * Handles changes in the selection UI element.
 * @param {!goog.events.BrowserEvent} e The event for the change.
 * @private
 */
audioCat.ui.widget.SelectInputWidget.prototype.handleInputChanged_ =
    function(e) {
  var selectedIndex = e.target['selectedIndex'];
  goog.asserts.assertNumber(selectedIndex);
  this.currentIndex_ = selectedIndex;
  this.dispatchEvent(audioCat.ui.widget.EventType.SELECTION_CHANGED);
  var container = this.getDom();

  // Add, then remove the toggle widget container to trigger a bg animation.
  goog.dom.classes.add(
        container, goog.getCssName('backgroundAnimatingContainer'));
  goog.global.setTimeout(function() {
    goog.dom.classes.remove(
        container, goog.getCssName('backgroundAnimatingContainer'));
  }, 300);
};

/**
 * @return {number} The current index.
 */
audioCat.ui.widget.SelectInputWidget.prototype.getCurrentIndex = function() {
  return this.currentIndex_;
};

/**
 * @return {string} The current key value.
 */
audioCat.ui.widget.SelectInputWidget.prototype.getCurrentKey = function() {
  return this.choices_[this.getCurrentIndex()].k;
};

/** @override */
audioCat.ui.widget.SelectInputWidget.prototype.cleanUp = function() {
  goog.events.unlistenByKey(this.rawInputListenerKey_);
  audioCat.ui.widget.SelectInputWidget.base(this, 'cleanUp');
};
