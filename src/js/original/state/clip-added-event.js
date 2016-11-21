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
goog.provide('audioCat.state.ClipAddedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched by a section when a clip is added.
 * @param {!audioCat.state.Clip} clip The added clip.
 * @param {number} timeBegin The duration at which the clip was added in
 *     seconds.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.ClipAddedEvent = function(clip, timeBegin) {
  goog.base(this, audioCat.state.events.CLIP_ADDED);

  /**
   * The added clip.
   * @private {!audioCat.state.Clip}
   */
  this.clip_ = clip;

  /**
   * The duration at which the clip should begin.
   * @private {number}
   */
  this.timeBegin_ = timeBegin;
};
goog.inherits(audioCat.state.ClipAddedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.Clip} The added clip.
 */
audioCat.state.ClipAddedEvent.prototype.getClip = function() {
  return this.clip_;
};

/**
 * @return {number} The start time in seconds of the clip relative to the start
 *     of the track.
 */
audioCat.state.ClipAddedEvent.prototype.getBeginTime = function() {
  return this.timeBegin_;
};
