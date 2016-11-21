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
goog.provide('audioCat.action.play.PlayPauseAction');

goog.require('audioCat.action.Action');


/**
 * Alternates between playing and pausing.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.play.PlayPauseAction = function(playManager) {
  goog.base(this);
  /**
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;
};
goog.inherits(audioCat.action.play.PlayPauseAction, audioCat.action.Action);

/** @override */
audioCat.action.play.PlayPauseAction.prototype.doAction = function() {
  if (this.playManager_.getPlayState()) {
    // We're currently playing. Pause.
    this.playManager_.pause();
  } else {
    // We're currently not playing. Play.
    this.playManager_.play();
  }
};
