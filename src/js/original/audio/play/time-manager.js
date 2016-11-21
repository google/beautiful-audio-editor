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
goog.provide('audioCat.audio.play.TimeManager');

goog.require('audioCat.audio.play.PlayManager');
goog.require('audioCat.audio.play.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.async.AnimationDelay');

/**
 * Manages the time of playing as well as the time into the audio that's
 * actually displayed to the user. These two times are usually equal, but can
 * differ when say the user drags the play cursor. This time value of course
 * only needs to be updated on every frame.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.play.TimeManager = function(playManager) {
  goog.base(this);

  /**
   * Manages the playing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * The time that is displayed to the user. Not necessarily the play time, but
   * the two are usually equal. For instance, the user could be dragging the
   * cursor around. We don't want to keep changing the play time since doing so
   * can be expensive. This time is in seconds.
   * @private {number}
   */
  this.indicatedTime_ = playManager.getTime();

  /**
   * The animation delay pegged to frame times. Used to update the indicated
   * time. Null when not playing.
   * @private {goog.async.AnimationDelay}
   */
  this.playAnimationDelay_ = null;

  // Change the indicated time as playing occurs.
  goog.events.listen(playManager, audioCat.audio.play.events.PLAY_BEGAN,
      this.handlePlayBegan_, false, this);
  goog.events.listen(playManager, audioCat.audio.play.events.PAUSED,
      this.handlePause_, false, this);

  // When the stable play time is manually changed, change the indicated time.
  goog.events.listen(playManager, audioCat.audio.play.events.PLAY_TIME_CHANGED,
      this.handlePlayTimeChanged_, false, this);
};
goog.inherits(audioCat.audio.play.TimeManager, audioCat.utility.EventTarget);

/**
 * @return {number} The time indicated to the user in seconds.
 */
audioCat.audio.play.TimeManager.prototype.getIndicatedTime = function() {
  return this.indicatedTime_;
};

/**
 * Sets the indicated time. Throws an event notifying the change.
 * @param {number} time Sets the time indicated to the user.
 */
audioCat.audio.play.TimeManager.prototype.setIndicatedTime = function(time) {
  this.indicatedTime_ = time;
  this.dispatchEvent(audioCat.audio.play.events.INDICATED_TIME_CHANGED);
};

/**
 * Handles what happens when the play time is manually changed.
 * @private
 */
audioCat.audio.play.TimeManager.prototype.handlePlayTimeChanged_ = function() {
  this.setIndicatedTime(this.playManager_.getTime());
};

/**
 * Sets the stable time. The stable time is the one actually considered by the
 * play manager for playing. Throws an event notifying the change. Also sets the
 * indicated time.
 * @param {number} time Sets the stable time used for playing.
 */
audioCat.audio.play.TimeManager.prototype.setStableTime = function(time) {
  this.playManager_.setTime(time);
  this.setIndicatedTime(time);
  this.dispatchEvent(audioCat.audio.play.events.STABLE_TIME_CHANGED);
};

/**
 * Handles what happens on a pause.
 * @private
 */
audioCat.audio.play.TimeManager.prototype.handlePause_ = function() {
  this.playAnimationDelay_.stop();
  this.playAnimationDelay_ = null;
};

/**
 * Handles what happens when play begins.
 * @private
 */
audioCat.audio.play.TimeManager.prototype.handlePlayBegan_ = function() {
  this.playLoop_();
};

/**
 * Enters the animation loop while playing.
 * @private
 */
audioCat.audio.play.TimeManager.prototype.playLoop_ = function() {
  var animationDelay = new goog.async.AnimationDelay(
      this.updateOnEachFrame_, undefined, this);
  animationDelay.start();
  this.playAnimationDelay_ = animationDelay;
};

/**
 * Does operations for each frame while playing.
 * @private
 */
audioCat.audio.play.TimeManager.prototype.updateOnEachFrame_ = function() {
  this.setIndicatedTime(this.playManager_.getTime());
  this.playLoop_();
};
