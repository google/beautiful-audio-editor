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
goog.provide('audioCat.state.TrackAddedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Thrown when a track is added.
 * @param {!audioCat.state.Track} track The added track.
 * @param {number} trackIndex The index at which the track was added.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.TrackAddedEvent = function(track, trackIndex) {
  goog.base(this, audioCat.state.events.TRACK_ADDED);

  /**
   * The added track.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The index at which the track was added.
   * @private {number}
   */
  this.trackIndex_ = trackIndex;
};
goog.inherits(audioCat.state.TrackAddedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.Track} The track added.
 */
audioCat.state.TrackAddedEvent.prototype.getTrack = function() {
  return this.track_;
};

/**
 * @return {number} The index at which the track was added.
 */
audioCat.state.TrackAddedEvent.prototype.getTrackIndex = function() {
  return this.trackIndex_;
};
