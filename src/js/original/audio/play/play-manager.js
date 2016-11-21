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
goog.provide('audioCat.audio.play.PlayManager');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.utility.EventTarget');


/**
 * Manages the playing of audio. Keeps track of the current play time, etc.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio contexts, both the online and offline ones.
 * @param {!audioCat.audio.AudioGraph} audioGraph The graph of audio.
 * @param {number=} opt_playTime The play time in seconds to start at. Defaults
 *     to 0.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.play.PlayManager =
    function(audioContextManager, audioGraph, opt_playTime) {
  goog.base(this);

  /**
   * Manages the online and offline audio contexts.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * The absolute time at which the previous play occurred. Use to determine
   * how much playing time we had experienced.
   * @private {number}
   */
  this.absolutePlayBeginTime_ = 0;

  /**
   * The graph of the audio.
   * @private {!audioCat.audio.AudioGraph}
   */
  this.audioGraph_ = audioGraph;

  /**
   * Whether playing is currently occuring. True iff playing.
   * @private {boolean}
   */
  this.playingState_ = false;

  /**
   * A float. The current time in seconds into the audio.
   * @private {number}
   */
  this.time_ = opt_playTime || 0;
};
goog.inherits(audioCat.audio.play.PlayManager, audioCat.utility.EventTarget);

/**
 * Plays the audio at the current time. Dispatches an event. Throws an exception
 * if already playing.
 */
audioCat.audio.play.PlayManager.prototype.play = function() {
  if (this.playingState_) {
    // Play attempted while already playing.
    throw 3;
  }
  this.audioGraph_.start(this.time_);
  this.playingState_ = true;
  this.absolutePlayBeginTime_ = this.audioContextManager_.getAbsoluteTime();
  this.dispatchEvent(audioCat.audio.play.events.PLAY_BEGAN);
};

/**
 * @return {boolean} Whether playing is currently occuring.
 */
audioCat.audio.play.PlayManager.prototype.getPlayState = function() {
  return this.playingState_;
};

/**
 * Pauses the audio at the current time. Dispatches an event. Throws an error if
 * already not playing.
 */
audioCat.audio.play.PlayManager.prototype.pause = function() {
  if (!this.playingState_) {
    // Pause attempted while not playing.
    throw 2;
  }
  this.playingState_ = false;

  // Update the private current time property after play stopped.
  this.setTime(this.time_ + this.audioContextManager_.getAbsoluteTime() -
      this.absolutePlayBeginTime_);

  this.audioGraph_.stopAllStartNodes();
  this.dispatchEvent(audioCat.audio.play.events.PAUSED);
};

/**
 * @return {number} The current play time in seconds into the audio.
 */
audioCat.audio.play.PlayManager.prototype.getTime = function() {
  if (this.playingState_) {
    // We're playing the audio, so get the current time through subtraction.
    // Update the private time property once playing has stopped.
    return this.time_ + this.audioContextManager_.getAbsoluteTime() -
        this.absolutePlayBeginTime_;
  }
  return this.time_;
};

/**
 * Sets the play time into the audio in seconds. Dispatches an event notifying
 * other entities of the change. Cannot be called while playing.
 * @param {number} time The current play time in seconds into the audio.
 */
audioCat.audio.play.PlayManager.prototype.setTime = function(time) {
  if (this.getPlayState()) {
    // Cannot manually set time while playing.
    throw 1;
  }

  this.time_ = time;
  // Dispatched when play time is changed while not playing.
  this.dispatchEvent(audioCat.audio.play.events.PLAY_TIME_CHANGED);
};
