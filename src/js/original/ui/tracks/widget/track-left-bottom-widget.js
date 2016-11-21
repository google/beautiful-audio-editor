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
goog.provide('audioCat.ui.tracks.widget.TrackLeftBottomWidget');

goog.require('goog.dom.classes');


/**
 * A button that resides on the bottom of the left side of the track panel.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {string} text The text to display on the button.
 * @param {string} arialLabel The label read to screen readers.
 * @constructor
 */
audioCat.ui.tracks.widget.TrackLeftBottomWidget = function(
    domHelper,
    text,
    arialLabel) {
  /**
   * The container for the widget.
   * @private {!Element}
   */
  this.container_ = domHelper.createElement('div');
  domHelper.setTabIndex(this.container_, 0);
  domHelper.setAriaLabel(this.container_, arialLabel);
  goog.dom.classes.add(this.container_,
      goog.getCssName('trackLeftBottomWidget'));

  // Create a background element that fades in upon hover.
  var backgroundElement = domHelper.createElement('div');
  goog.dom.classes.add(backgroundElement, goog.getCssName('backgroundElement'));
  domHelper.appendChild(this.container_, backgroundElement);

  // Create the element that actually contains the text.
  var contentContainer = domHelper.createElement('div');
  domHelper.setTextContent(contentContainer, text);
  goog.dom.classes.add(contentContainer, goog.getCssName('contentContainer'));
  domHelper.appendChild(this.container_, contentContainer);

  domHelper.listenForUpPress(this.container_, function() {
    this.handleUpPress();
  }, false, this);
};

/**
 * The method to call when the user presses up. Override this method to give the
 * widget functionality.
 * @protected
 */
audioCat.ui.tracks.widget.TrackLeftBottomWidget.prototype.handleUpPress =
    goog.abstractMethod;

/**
 * @return {!Element} The container for the widget.
 */
audioCat.ui.tracks.widget.TrackLeftBottomWidget.prototype.getDom = function() {
  return this.container_;
};
