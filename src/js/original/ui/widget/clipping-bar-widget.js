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
goog.provide('audioCat.ui.widget.ClippingBarWidget');

goog.require('audioCat.ui.widget.Widget');


/**
 * A widget that represents a single bar for detecting clipping in a channel.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @extends {audioCat.ui.widget.Widget}
 * @constructor
 */
audioCat.ui.widget.ClippingBarWidget = function(domHelper) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The base clipping bar element.
   * @private {!Element}
   */
  this.baseElement_ = domHelper.createDiv(
      goog.getCssName('clippingBarWidgetContainer'));
  goog.base(this, this.baseElement_);

  /**
   * The internal colored section.
   * @private {!Element}
   */
  this.coloredSection_ = domHelper.createDiv(
      goog.getCssName('clippingBarWidgetColoredSection'));
  domHelper.appendChild(this.baseElement_, this.coloredSection_);

  /**
   * The index of the current color to use.
   * @private {number}
   */
  this.colorIndex_ = 0;
  this.setInternalColor_(this.colorIndex_);

  // Initially, there is no sound.
  this.setSampleValue(0);
};
goog.inherits(audioCat.ui.widget.ClippingBarWidget, audioCat.ui.widget.Widget);


/**
 * An array of colors for clipping bars to use in progressively more concerning
 * order.
 * @private {!Array.<string>}
 */
audioCat.ui.widget.ClippingBarWidget.COLORS_ = [
    '#bdff44', // Lime.
    '#ffcb0d', // Orange.
    '#f00' // Red.
  ];


/**
 * Sets the width of the colored section given the sample value.
 * @param {number} sampleValue The sample value to set.
 */
audioCat.ui.widget.ClippingBarWidget.prototype.setSampleValue =
    function(sampleValue) {
  var colorIndex;
  var percentValue = sampleValue * 100;
  if (percentValue >= 100) {
    colorIndex = 2;
    percentValue = 100;
  } else if (percentValue >= 90) {
    colorIndex = 1;
  } else {
    colorIndex = 0;
  }
  if (colorIndex != this.colorIndex_) {
    // The color changed, so update the element.
    this.setInternalColor_(colorIndex);
  }
  this.domHelper_.setCssTransform(
      this.coloredSection_, 'scaleX(' + sampleValue + ')');
};

/**
 * Sets the color of the internal of the bar based on the color index. Forces a
 * DOM interaction. Updates the current color.
 * @param {number} colorIndex The index of the color to set.
 * @private
 */
audioCat.ui.widget.ClippingBarWidget.prototype.setInternalColor_ =
    function(colorIndex) {
  this.coloredSection_.style.background =
      audioCat.ui.widget.ClippingBarWidget.COLORS_[colorIndex];
  this.colorIndex_ = colorIndex;
};
