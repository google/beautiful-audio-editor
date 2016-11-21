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
goog.provide('audioCat.ui.widget.ButtonWidget');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/** @typedef {string|!Element} */
var Contentable;


/**
 * A generic button that could say be used on a form.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!Contentable} content The content within the button.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.ButtonWidget = function(domHelper, content) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;
  goog.base(this, domHelper.createElement('div'));

  this.setContent(content);
  this.resetClasses();

  /**
   * The function to perform upon an up press of the button if a callback
   * exists.
   * @private {Function}
   */
  this.upPressCallback_ = null;
};
goog.inherits(audioCat.ui.widget.ButtonWidget, audioCat.ui.widget.Widget);

/**
 * Sets the content of the button.
 * @param {!Contentable} content The content to set the button to.
 */
audioCat.ui.widget.ButtonWidget.prototype.setContent = function(content) {
  var domHelper = this.domHelper_;
  if (content instanceof String || typeof content == 'string') {
    domHelper.setRawInnerHtml(this.getDom(), content);
  } else {
    var element = this.getDom();
    domHelper.removeChildren(element);
    domHelper.appendChild(element, /** @type {!Element} */ (content));
  }
};

/**
 * Assigns a function to perform on the button on mouse / press up.
 * @param {!Function} callback The callback to perform on press up.
 */
audioCat.ui.widget.ButtonWidget.prototype.performOnUpPress =
    function(callback) {
  this.domHelper_.listenForUpPress(this.getDom(), callback);
  this.upPressCallback_ = callback;
};

/**
 * Clears the callback to be called on up press if one exists.
 */
audioCat.ui.widget.ButtonWidget.prototype.clearUpPressCallback = function() {
  if (!this.upPressCallback_) {
    // No callback to clear.
    return;
  }
  this.domHelper_.unlistenForUpPress(this.getDom(), this.upPressCallback_);
  this.upPressCallback_ = null;
};

/**
 * Restores the original class of the button. Removes other classes.
 */
audioCat.ui.widget.ButtonWidget.prototype.resetClasses = function() {
  this.getDom().className = goog.getCssName('buttonWidget');
};
