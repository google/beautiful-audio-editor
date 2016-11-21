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
goog.provide('audioCat.state.TrackChangedForSectionEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');

/**
 * Dispatched when a track changes for a section.
 * @param {audioCat.state.Track} track The new track of the section. Or null
 *     if the track is set to nothing.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.TrackChangedForSectionEvent = function(track) {
  goog.base(this, audioCat.state.events.TRACK_CHANGED_FOR_SECTION);

  /**
   * The new track of the section.
   * @private {audioCat.state.Track}
   */
  this.track_ = track;
};
goog.inherits(
    audioCat.state.TrackChangedForSectionEvent, audioCat.utility.Event);

/**
 * @return {audioCat.state.Track} The new track of the section or null if the
 *     section no longer belongs to a track.
 */
audioCat.state.TrackChangedForSectionEvent.prototype.getTrack = function() {
  return this.track_;
};
