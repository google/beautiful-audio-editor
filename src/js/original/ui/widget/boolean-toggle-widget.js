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
goog.provide('audioCat.ui.widget.BooleanToggleWidget');

goog.require('audioCat.ui.widget.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A widget for toggling a boolean.
 * @param {!audioCat.utility.DomHelper} domHelper Interacts with the DOM.
 * @param {string} description A string to accompany the boolean.
 * @param {boolean=} opt_value An initial value to assign this boolean. Defaults
 *     to false.
 * @param {string=} opt_additionalClassName An additional class name to give the
 *     whole widget.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.BooleanToggleWidget = function(
    domHelper, description, opt_value, opt_additionalClassName) {
  var container = domHelper.createDiv(goog.getCssName('inputDeviceWidget'));
  goog.base(this, container);

  /**
   * The current boolean value.
   * @private {boolean}
   */
  this.value_ = !!opt_value;

  // Create the checkbox input element.
  var checkbox = domHelper.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  if (opt_value) {
    checkbox.setAttribute('checked', 'checked');
  }
  var checkboxWrapper = domHelper.createDiv(goog.getCssName('checkboxWrapper'));
  domHelper.appendChild(checkboxWrapper, checkbox);
  domHelper.appendChild(container, checkboxWrapper);

  // Dispatch our own event if the checkbox changes.

  /**
   * The key for the listener on the checkbox.
   * @private {number|goog.events.ListenableKey}
   */
  this.checkboxListenerKey_ = goog.events.listen(
      checkbox, 'change', this.handleCheckboxChanged_, false, this);

  // Wrap the description.
  var descriptionWrapper = domHelper.createDiv(
      goog.getCssName('checkboxDescriptionWrapper'));
  domHelper.setRawInnerHtml(descriptionWrapper, description);
  domHelper.appendChild(container, descriptionWrapper);
};
goog.inherits(
    audioCat.ui.widget.BooleanToggleWidget, audioCat.ui.widget.Widget);

/**
 * Handles changes in the checkbox UI element.
 * @private
 */
audioCat.ui.widget.BooleanToggleWidget.prototype.handleCheckboxChanged_ =
    function() {
  this.value_ = !this.value_;
  this.dispatchEvent(audioCat.ui.widget.EventType.BOOLEAN_TOGGLED);
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
 * @return {boolean} The current value.
 */
audioCat.ui.widget.BooleanToggleWidget.prototype.getValue = function() {
  return this.value_;
};

/** @override */
audioCat.ui.widget.BooleanToggleWidget.prototype.cleanUp = function() {
  goog.events.unlistenByKey(this.checkboxListenerKey_);
  audioCat.ui.widget.BooleanToggleWidget.base(this, 'cleanUp');
};
