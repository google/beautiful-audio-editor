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
goog.provide('audioCat.ui.widget.ClipDetectorWidget');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.ui.widget.ClippingBarWidget');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.async.AnimationDelay');
goog.require('goog.events');


/**
 * A widget that indicates when clipping occurs by having bars turning red.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing.
 * @param {!audioCat.audio.Analyser} audioAnalyser Analyses audio.
 * @param {number} numberOfChannels The number of output channels to check
 *     clipping for.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.ClipDetectorWidget = function(
    domHelper,
    playManager,
    audioAnalyser,
    numberOfChannels) {
  /**
   * The audio analyser.
   * @private {!audioCat.audio.Analyser}
   */
  this.audioAnalyser_ = audioAnalyser;

  /**
   * The base element.
   * @private {!Element}
   */
  this.baseElement_ = domHelper.createDiv(
      goog.getCssName('clipDetectorWidgetContainer'));
  goog.base(this, this.baseElement_);

  // TODO(chizeng): Use 2D canvas instead of these DOM-based clipping bars.
  // OR it could be the script processor just being too slow. Skip more frames.
  var clippingBarWidgets = new Array(numberOfChannels);
  for (var i = 0; i < numberOfChannels; ++i) {
    clippingBarWidgets[i] = new audioCat.ui.widget.ClippingBarWidget(domHelper);
    domHelper.appendChild(this.baseElement_, clippingBarWidgets[i].getDom());
  }
  /**
   * A list of clipping bar widgets. One for each channel.
   * @private {!Array.<!audioCat.ui.widget.ClippingBarWidget>}
   */
  this.clippingBarWidgets_ = clippingBarWidgets;

  /**
   * A count of how many calls to requestAnimation have occurred. Used to only
   * draw on even calls.
   * @private {number}
   */
  this.drawIndex_ = 0;

  /**
   * The animation delay pegged to frame times. Used to update the indicated
   * time. Null when not playing.
   * @private {goog.async.AnimationDelay}
   */
  this.playAnimationDelay_ = null;

  // Respond to changes in play status.
  /**
   * Keys of listeners to remove upon clean up.
   * @private {!Array.<goog.events.Key>}
   */
  this.listenerKeys_ = [
      goog.events.listen(playManager, audioCat.audio.play.events.PLAY_BEGAN,
          this.handlePlayBegan_, false, this),
      goog.events.listen(playManager, audioCat.audio.play.events.PAUSED,
          this.handlePlayPause_, false, this)
    ];

  // Start animation iff we're playing.
  if (playManager.getPlayState()) {
    this.doAnimationLoop_();
  }
};
goog.inherits(audioCat.ui.widget.ClipDetectorWidget, audioCat.ui.widget.Widget);

/**
 * Updates the clipping bars.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.updateClippingBarWidgets_ =
    function() {
  var audioAnalyser = this.audioAnalyser_;
  var clippingBarWidgets = this.clippingBarWidgets_;
  audioAnalyser.computeCurrentSampleMaxesPerChannel();
  for (var i = 0; i < clippingBarWidgets.length; ++i) {
    clippingBarWidgets[i].setSampleValue(
        audioAnalyser.obtainCurrentSampleMax(i));
  }
};

/**
 * Handles what happens when playing of audio begins.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.handlePlayBegan_ = function() {
  this.doAnimationLoop_();
};

/**
 * Begins the animation.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.doAnimationLoop_ = function() {
  var animationDelay = new goog.async.AnimationDelay(
      this.doPerVisualFrame_, undefined, this);
  animationDelay.start();
  this.playAnimationDelay_ = animationDelay;
};

/**
 * Draws, then requests more drawing on the next visual frame.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.doPerVisualFrame_ =
    function() {
  if (this.drawIndex_ & 1) {
    // Render every other frame. We don't need 60 FPS. 30 suffices.
    this.updateClippingBarWidgets_();
  }
  this.drawIndex_ += 1;
  this.doAnimationLoop_();
};

/**
 * Handles what happens when playing of audio pauses.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.handlePlayPause_ =
    function() {
  this.stopAnimation_();
  // 2 more draws to clear the canvas since each draw resets at the end.
  this.clearClippingBarWidgets_();
};

/**
 * Clears the clipping bar widgets.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.clearClippingBarWidgets_ =
    function() {
  var clippingBarWidgets = this.clippingBarWidgets_;
  for (var i = 0; i < clippingBarWidgets.length; ++i) {
    clippingBarWidgets[i].setSampleValue(0);
  }
};

/**
 * Stops the animation if the animation had been playing. Otherwise, does
 * nothing.
 * @private
 */
audioCat.ui.widget.ClipDetectorWidget.prototype.stopAnimation_ =
    function() {
  if (this.playAnimationDelay_) {
    this.playAnimationDelay_.stop();
    this.playAnimationDelay_ = null;
  }
  this.drawIndex_ = 0;
};

/** @override */
audioCat.ui.widget.ClipDetectorWidget.prototype.cleanUp = function() {
  for (var i = 0; i < this.clippingBarWidgets_.length; ++i) {
    this.clippingBarWidgets_[i].cleanUp();
  }
  this.clippingBarWidgets_.length = 0;

  for (var i = 0; i < this.listenerKeys_.length; ++i) {
    goog.events.unlistenByKey(this.listenerKeys_[i]);
  }

  audioCat.ui.widget.ClipDetectorWidget.base(this, 'cleanUp');
};
