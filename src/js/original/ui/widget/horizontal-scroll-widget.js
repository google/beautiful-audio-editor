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
goog.provide('audioCat.ui.widget.HorizontalScrollWidget');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A widget that replaces the functionality of a default scrollbar. This is
 * needed for mobile since mobile browsers scroll choppily.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions
 *     with the DOM.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     scrolling and resizing.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the zoom level representation.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!Element} layout The layout of the application. Used for determining
 *     the max scroll distance.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.HorizontalScrollWidget = function(
    domHelper,
    scrollResizeManager,
    timeDomainScaleManager,
    dialogManager,
    layout) {
  var container =
      domHelper.createDiv(goog.getCssName('horizontalScrollWidgetContainer'));
  goog.base(this, container);

  /**
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * The latest scroll width of the layout, used to determine how much scroll
   * space there is.
   * @private {number}
   */
  this.latestScrollbarLength_ = 100;

  /**
   * The min value of the range input element.
   * @private {number}
   */
  this.minSliderValue_ = 0;

  /**
   * The max value of the range input element.
   * @private {number}
   */
  this.maxSliderValue_ = 1000;

  // Set to -1 to force an update within the call to updateSlider_ below.
  /**
   * The current value of the slider.
   * @private {number}
   */
  this.sliderValue_ = -1;

  /**
   * The range input element.
   * @private {!Element}
   */
  this.inputElement_ = domHelper.createElement('input');
  this.inputElement_.type = 'range';
  this.inputElement_.min = this.minSliderValue_;
  this.inputElement_.max = this.maxSliderValue_;
  goog.dom.classes.add(this.inputElement_, goog.getCssName('scrollInput'));
  domHelper.appendChild(container, this.inputElement_);

  // Periodically update the scroll width.
  goog.global.setInterval(
      goog.bind(this.updateLatestScrollbarLength_, this, layout), 100);
  this.updateLatestScrollbarLength_(layout);

  goog.events.listen(
      this.inputElement_, 'input', this.handleInput_, false, this);
  goog.events.listen(
      this.inputElement_, 'change', this.handleInput_, false, this);
};
goog.inherits(
    audioCat.ui.widget.HorizontalScrollWidget, audioCat.ui.widget.Widget);

/**
 * Handles input events - changes in slider value by the user.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.handleInput_ = function() {
  this.sliderValue_ = this.inputElement_.value;
  this.setHorizontalScroll_(this.sliderValue_ *
      this.latestScrollbarLength_ / this.maxSliderValue_);
};

/**
 * Updates the slider value.
 * @param {number} sliderValue The slider value.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.setSliderValue_ =
    function(sliderValue) {
  if (this.sliderValue_ != sliderValue) {
    this.sliderValue_ = sliderValue;
    this.inputElement_.value = sliderValue;
  }
};

/**
 * Sets the slider value based on the horizontal scroll.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.updateSlider_ = function() {
  this.setSliderValue_(Math.round(this.maxSliderValue_ *
      this.scrollResizeManager_.getLeftRightScroll() /
          this.latestScrollbarLength_));
};

/**
 * Periodically called for updating the latest collected scroll width of the
 * whole application. This is used to determine how much space we have to scroll
 * in total.
 * @param {!Element} layout The layout element.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.
    updateLatestScrollbarLength_ = function(layout) {
  if (this.scrollResizeManager_.isGoodTimeForScrollCompute()) {
    // Only perform horizontal scroll-related computations if now is a good time
    // to do so. It may be a bad time to do so for instance if we're performing
    // some atomic operation. For example, we may be splitting a section, in
    // which we remove a section before adding 2 new ones.
    if (!(this.sliderValue_ >= 0)) {
      // We have not successfully set a slider value. Do so. The value is now
      // either -1 or NaN, so note that < will not work.
      this.updateSlider_();
    }
    var newScrollbarLength = layout.scrollWidth - layout.offsetWidth;
    if (this.latestScrollbarLength_ != newScrollbarLength) {
      this.latestScrollbarLength_ = newScrollbarLength;
      this.handleChangeInScrollWidth_();
    }
  }
};

/**
 * Handles what happens when the width of the application changes.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.handleChangeInScrollWidth_ =
    function() {
  var leftRightScroll = this.scrollResizeManager_.getLeftRightScroll();
  if (leftRightScroll > this.latestScrollbarLength_) {
    this.setHorizontalScroll_(this.latestScrollbarLength_);
  }
  this.updateSlider_();
};

/**
 * Changes the horizontal scroll of the application.
 * @param {number} horizontalScroll The new horizontal scroll.
 * @private
 */
audioCat.ui.widget.HorizontalScrollWidget.prototype.setHorizontalScroll_ =
    function(horizontalScroll) {
  this.scrollResizeManager_.setHorizontalScroll(horizontalScroll);
};
