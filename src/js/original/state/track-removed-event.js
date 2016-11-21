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
goog.provide('audioCat.state.TrackRemovedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Thrown when a track is removed.
 * @param {number} trackIndex The index at which the track was removed.
 * @param {!audioCat.state.Track} trackRemoved The track that was removed.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.TrackRemovedEvent = function(trackIndex, trackRemoved) {
  goog.base(this, audioCat.state.events.TRACK_REMOVED);

  /**
   * The index at which the track was removed.
   * @private {number}
   */
  this.trackIndex_ = trackIndex;

  /**
   * The track that was removed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = trackRemoved;
};
goog.inherits(audioCat.state.TrackRemovedEvent, audioCat.utility.Event);

/**
 * @return {number} The index at which the track was removed.
 */
audioCat.state.TrackRemovedEvent.prototype.getTrackIndex = function() {
  return this.trackIndex_;
};

/**
 * @return {!audioCat.state.Track} The track removed.
 */
audioCat.state.TrackRemovedEvent.prototype.getTrack = function() {
  return this.track_;
};
