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
goog.provide('audioCat.ui.widget.PlayPointer');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.ui.text.Precision');
goog.require('audioCat.ui.visualization.events');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A pointer that follows playing of audio near the time-domain ruler. Also
 * displays the current play time on top of it.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.window.ScrollResizeManager} resizeScrollManager
 *     Manages window resize and scrolling.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     audio.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the time
 *     actually displayed to the user.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the time scale.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.PlayPointer = function(
    domHelper,
    resizeScrollManager,
    playManager,
    timeManager,
    timeDomainScaleManager,
    timeFormatter) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages scrolling and resizing.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.resizeScrollManager_ = resizeScrollManager;

  /**
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  /**
   * Manages playing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * Manages the time displayed to the user.
   * @private {!audioCat.audio.play.TimeManager}
   */
  this.timeManager_ = timeManager;

  /**
   * Manages the time-domain scale.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  var container = domHelper.createDiv(goog.getCssName('playPointer'));
  goog.base(this, container);

  /**
   * Contains the current time.
   * @private {!Element}
   */
  this.currentTimeContainer_ = domHelper.createDiv(
      goog.getCssName('currentTimeContainer'));
  domHelper.appendChild(container, this.currentTimeContainer_);

  /**
   * The pixel distance from the left the container is located at.
   * @private {number}
   */
  this.leftPixelDistance_ = 0;

  /**
   * Whether the play pointer is currently displayed. It's hidden when it's out
   * of view. We store this value so that we don't have to access the DOM to
   * find out.
   * @private {boolean}
   */
  this.displayed_ = true;

  // This method also sets the current time display.
  this.positionBasedOnTime_();

  /**
   * The client X value upon the previous downpress on the pointer. Meaningless
   * if no previous downpress has occurred, or the previous drag has ended.
   * @private {number}
   */
  this.onDragClientX_ = 0;

  /**
   * The indicatd time upon the previous downpress on the pointer. Meaningless
   * if not currently in a drag.
   * @private {number}
   */
  this.onDragIndicatedTime_ = 0;

  // Change the pointer's left pixel distance when the indicated time changes.
  goog.events.listen(timeManager,
      audioCat.audio.play.events.INDICATED_TIME_CHANGED,
      this.handleIndicatedTimeChange_, false, this);

  // Change the pointer's left pixel distance when the zoom level changes.
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.ZOOM_CHANGED, this.handleZoomChange_,
      false, this);

  // Allow for dragging.
  domHelper.listenForDownPress(container, this.handleDownPress_, false, this);

  // Reposition the pointer upon scrolling.
  resizeScrollManager.callAfterScroll(goog.bind(this.handleScroll_, this));
};
goog.inherits(audioCat.ui.widget.PlayPointer, audioCat.ui.widget.Widget);

/**
 * Handles what happens when the user scrolls the page horizontally.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleScroll_ = function() {
  this.positionBasedOnTime_();
};

/**
 * Handles what happens when the user zooms in or out.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleZoomChange_ = function() {
  this.positionBasedOnTime_();
};

/**
 * Handles what happens when the user presses down on the pointer.
 * @param {!goog.events.BrowserEvent} event The associated event.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleDownPress_ = function(event) {
  var playManager = this.playManager_;
  if (playManager.getPlayState()) {
    playManager.pause();
  }
  var domHelper = this.domHelper_;
  this.onDragClientX_ = domHelper.obtainClientX(event);
  this.onDragIndicatedTime_ = this.timeManager_.getIndicatedTime();
  domHelper.listenForMove(domHelper.getDocument(), this.handleMoveOnDrag_,
      false, this);
  domHelper.listenForUpPress(
      domHelper.getDocument(), this.handleUpPressEndDrag_, false, this, true);
};

/**
 * Handles what happens when the user moves around the document while dragging.
 * @param {!goog.events.BrowserEvent} event The associated mouse move event.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleMoveOnDrag_ = function(event) {
  this.timeManager_.setIndicatedTime(
      this.computeLeftDistanceOnDrag_(this.domHelper_.obtainClientX(event)));
};

/**
 * Handles what happens when the user releases the mouse to end a drag.
 * @param {!goog.events.BrowserEvent} event The associated mouse event.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleUpPressEndDrag_ =
    function(event) {
  this.timeManager_.setStableTime(
      this.computeLeftDistanceOnDrag_(this.domHelper_.obtainClientX(event)));
  var domHelper = this.domHelper_;
  domHelper.unlistenForMove(domHelper.getDocument(), this.handleMoveOnDrag_,
      false, this);
};

/**
 * Computes the indicated time while dragging. This time may be only temporary
 * since the user could be actively modifying the time.
 * @param {number} currentClientX The current client X time.
 * @return {number} The indicated time.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.computeLeftDistanceOnDrag_ =
    function(currentClientX) {
  var distanceDelta = currentClientX - this.onDragClientX_;
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var newIndicatedTime = this.onDragIndicatedTime_ +
      scale.convertToSeconds(distanceDelta);
  // Negative time makes no sense. Clamp to 0.
  return (newIndicatedTime > 0) ? newIndicatedTime : 0;
};

/**
 * Handles what happens when the indicated time is changed.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.handleIndicatedTimeChange_ =
    function() {
  this.positionBasedOnTime_();
};

/**
 * Positions the play pointer based on the currently indicated time, scroll,
 * and time-domain scale. Also sets the current time display.
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.positionBasedOnTime_ = function() {
  // Correctly position the play pointer, which also positions the time display.
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var indicatedTime = this.timeManager_.getIndicatedTime();
  var leftDistance = scale.convertToPixels(indicatedTime);
  leftDistance -= this.resizeScrollManager_.getLeftRightScroll();

  // Hide the pointer if it's out of view, so it doesn't block other things.
  if (leftDistance < 0) {
    if (this.displayed_) {
      // Hide if displayed.
      goog.dom.classes.add(this.getDom(), goog.getCssName('undisplayed'));
      this.displayed_ = false;
      // We no longer need to take care of changing the presentation.
      return;
    }
  } else {
    // We should display the pointer.
    if (!this.displayed_) {
      // Show if hidden.
      goog.dom.classes.remove(this.getDom(), goog.getCssName('undisplayed'));
      this.displayed_ = true;
    }
  }

  // Actually set the distance in pixels from the left.
  this.setLeftPixelDistance_(leftDistance);

  // Set the current time display.
  this.domHelper_.setTextContent(
      this.currentTimeContainer_,
      this.timeFormatter_.formatTime(
          indicatedTime, audioCat.ui.text.Precision.MS)
    );
};

/**
 * Sets the distance from the left of the play pointer in pixels.
 * @param {number} pixelDistance
 * @private
 */
audioCat.ui.widget.PlayPointer.prototype.setLeftPixelDistance_ =
    function(pixelDistance) {
  this.getDom().style.left = pixelDistance + 'px';
  this.leftPixelDistance_ = pixelDistance;
};
