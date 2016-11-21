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
goog.provide('audioCat.ui.widget.PlayLineWidget');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.ui.visualization.events');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Manages a line that follows playing audio above the track panel.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages how time is visualized in the time domain.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     scrolling and resizing.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the currently
 *     displayed play time.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.PlayLineWidget = function(
    domHelper,
    timeDomainScaleManager,
    scrollResizeManager,
    timeManager) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages how audio is displayed in the time domain.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * Manages scrolling and resizing.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Manages the current play time.
   * @private {!audioCat.audio.play.TimeManager}
   */
  this.timeManager_ = timeManager;

  /**
   * Whether the container for the line is visible. It is hidden for instance
   * when it is positioned over track descriptors.
   * @private {boolean}
   */
  this.containerVisible_ = true;

  var container = domHelper.createElement('div');
  goog.dom.classes.add(container, goog.getCssName('playLine'));
  goog.base(this, container);

  this.setLinePositionAndHeight_();

  // Fix the line when we scroll or resize.
  scrollResizeManager.callAfterScroll(
      goog.bind(this.setLinePositionAndHeight_, this));

  // Redraw and reposition the line if the user changes the zoom.
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.ZOOM_CHANGED,
      this.setLinePositionAndHeight_, false, this);

  // Reposition the X position of the line upon playing.
  goog.events.listen(timeManager,
      audioCat.audio.play.events.INDICATED_TIME_CHANGED,
      this.rectifyLinePosition_, false, this);
};
goog.inherits(audioCat.ui.widget.PlayLineWidget, audioCat.ui.widget.Widget);

/**
 * Places the cursor in the correct position from the left in pixels.
 * @private
 */
audioCat.ui.widget.PlayLineWidget.prototype.setLinePositionAndHeight_ =
    function() {
  // Actually set the left distance on the element.
  this.rectifyLinePosition_();

  // Set the correct height.
  this.rectifyHeight_();
};

/**
 * Positions the play line correctly. Hides the line if it is not supposed to
 * be displayed - for instance, the line might be on top of track descriptors.
 * @private
 */
audioCat.ui.widget.PlayLineWidget.prototype.rectifyLinePosition_ = function() {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var leftDistance = scale.convertToPixels(
      this.timeManager_.getIndicatedTime());
  leftDistance -= this.scrollResizeManager_.getLeftRightScroll();
  if (leftDistance < 0) {
    this.setVisible_(false);
    return;
  }
  this.setVisible_(true);
  this.setLeftPixelDistance_(leftDistance);
};

/**
 * Sets whether the line is visible or not.
 * @param {boolean} visible Whether the line is visible.
 * @private
 */
audioCat.ui.widget.PlayLineWidget.prototype.setVisible_ = function(visible) {
  if (this.containerVisible_ == visible) {
    // No DOM manipulation needed.
    return;
  }
  this.getDom().style.visibility = visible ? 'visible' : 'hidden';
  this.containerVisible_ = visible;
};

/**
 * Sets the right height for the line.
 * @private
 */
audioCat.ui.widget.PlayLineWidget.prototype.rectifyHeight_ = function() {
  this.getDom().style.height =
      String(this.scrollResizeManager_.getWindowHeight()) + 'px';
};

/**
 * Places the cursor in the correct position from the left in pixels.
 * @param {number} leftDistance The distance from the left in pixels to place
 *     the line.
 * @private
 */
audioCat.ui.widget.PlayLineWidget.prototype.setLeftPixelDistance_ =
    function(leftDistance) {
  this.getDom().style.left = String(leftDistance) + 'px';
};
