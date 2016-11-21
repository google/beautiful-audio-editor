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
goog.provide('audioCat.ui.visualization.TimeDomainScaleManager');

goog.require('audioCat.ui.visualization.NumberConstant');
goog.require('audioCat.ui.visualization.TimeDomainScale');
goog.require('audioCat.ui.visualization.TimeUnit');
goog.require('audioCat.ui.visualization.ZoomChangedEvent');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Manages the current time scale to render audio with. Also manages whether to
 * currently display audio in the time domain in terms of time or in terms of
 * notes and bars.
 * @param {!audioCat.audio.SignatureTempoManager} signatureTempoManager Manages
 *     the current tempo and time signature.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.visualization.TimeDomainScaleManager = function(
      signatureTempoManager) {
  goog.base(this);

  /**
   * If true, displays audio over time using score.
   * @private {boolean} Whether the display audio with score instead of time.
   */
  this.displayAudioUsingScore_ = false;

  /**
   * Manages the current tempo and time signature.
   * @private {!audioCat.audio.SignatureTempoManager}
   */
  this.signatureTempoManager_ = signatureTempoManager;

  /**
   * The display height of a single section (controlled by CSS) in pixels.
   * @private {number}
   */
  this.sectionHeight_ = 100;

  /**
   * Time scales in increasing order of zoom.
   * @private {!Array.<!audioCat.ui.visualization.TimeDomainScale>}
   */
  this.timeScales_ = [
      // 80px = 1 second, Round to 0 decimal places, and 3 minors / major tick.
      new audioCat.ui.visualization.TimeDomainScale(
          60, 120, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 60, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 30, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 15, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 10, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 5, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 2, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          60, 1, audioCat.ui.visualization.TimeUnit.S, 0, 3),
      new audioCat.ui.visualization.TimeDomainScale(
          80, 500, audioCat.ui.visualization.TimeUnit.MS, 0, 7),
      new audioCat.ui.visualization.TimeDomainScale(
          80, 250, audioCat.ui.visualization.TimeUnit.MS, 0, 15)
    ];

  /**
   * The index into the timeScales_ list indicating the current time scale used.
   * @private {number}
   */
  this.currentScaleIndex_ =
      audioCat.ui.visualization.NumberConstant.DEFAULT_ZOOM_LEVEL;
};
goog.inherits(audioCat.ui.visualization.TimeDomainScaleManager,
    audioCat.utility.EventTarget);

/**
 * @return {!audioCat.audio.SignatureTempoManager} The signature tempo manager.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.
    getSignatureTempoManager = function() {
  return this.signatureTempoManager_;
};

/**
 * @return {boolean} Whether to display audio using score instead of time.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.
    getDisplayAudioUsingBars = function() {
  return this.displayAudioUsingScore_;
};

/**
 * Sets whether to display audio using score instead of time.
 * @param {boolean} displayAudioUsingScore
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.
    setDisplayAudioUsingBars = function(displayAudioUsingScore) {
  this.displayAudioUsingScore_ = displayAudioUsingScore;
  this.dispatchEvent(audioCat.ui.visualization.events.SCORE_TIME_SWAPPED);
};

/**
 * @return {number} The current zoom level ranging from 0 (the most zoomed-in
 *     to (this.getNumberOfScales() - 1) (the most zoomed-out).
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getZoomLevel =
    function() {
  return this.currentScaleIndex_;
};

/**
 * @return {number} The number of scales.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getNumberOfScales =
    function() {
  return this.timeScales_.length;
};

/**
 * @return {boolean} Whether we can still zoom in.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.canZoomIn =
    function() {
  return this.currentScaleIndex_ == 0;
};

/**
 * @return {boolean} Whether we can still zoom out.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.canZoomOut =
    function() {
  return this.currentScaleIndex_ + 1 == this.timeScales_.length;
};

/**
 * Goes to a certain zoom index. Assumes that it is possible. Higher indices
 * are more zoomed in. Dispatches an event.
 * @param {number} zoomIndex The zoom index to go to.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.zoomToIndex =
    function(zoomIndex) {
  var previousZoomIndex = this.currentScaleIndex_;
  if (zoomIndex != previousZoomIndex) {
    // The zoom level is different that the previous one. Change it.
    this.currentScaleIndex_ = zoomIndex;
    this.dispatchEvent(new audioCat.ui.visualization.ZoomChangedEvent(
        previousZoomIndex, zoomIndex, this.timeScales_[zoomIndex]));
  }
};

/**
 * @return {!audioCat.ui.visualization.TimeDomainScale} The current scale.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getCurrentScale =
    function() {
  return this.getScaleAtIndex(this.currentScaleIndex_);
};

/**
 * Gets the scale associated with a certain zoom index.
 * @param {number} zoomIndex The zoom index. Might not be the current one.
 * @return {!audioCat.ui.visualization.TimeDomainScale} The scale.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getScaleAtIndex =
    function(zoomIndex) {
  return this.timeScales_[zoomIndex];
};

/**
 * Zooms in. Goes to the next higher zoom. Assumes that is possible.
 * Dispatches an event notifying other objects of a zoom change.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.zoomIn = function() {
  this.zoomToIndex(this.currentScaleIndex_ + 1);
};

/**
 * Zooms out. Goes to the next lower zoom. Assumes that is possible.
 * Dispatches an event notifying other objects of a zoom change.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.zoomOut =
    function() {
  this.zoomToIndex(this.currentScaleIndex_ - 1);
};

/**
 * Returns the farthest you can zoom out - the lowest time scale index possible.
 * @return {number}
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getLowestScale =
    function() {
  return 0;
};

/**
 * Returns the closest you can zoom in - the highest time scale index possible.
 * @return {number}
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getHighestScale =
    function() {
  return this.timeScales_.length - 1;
};

/**
 * @return {number} The display height of a section of audio. Controlled by CSS.
 *     Canvases may draw to a different height, but then get resized by CSS.
 */
audioCat.ui.visualization.TimeDomainScaleManager.prototype.getSectionHeight =
    function() {
  return this.sectionHeight_;
};
