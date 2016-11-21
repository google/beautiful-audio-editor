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
goog.provide('audioCat.state.TrackManager');

goog.require('audioCat.state.TrackAddedEvent');
goog.require('audioCat.state.TrackRemovedEvent');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.array');
goog.require('goog.events');


/**
 * Manages tracks. Throws events to notify other entities of changes to tracks.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.TrackManager = function() {
  goog.base(this);

  /**
   * Tracks for the project.
   * @private {!Array.<!audioCat.state.Track>}
   */
  this.tracks_ = [];

  /**
   * The track that is currently solo-ed. null if none.
   * @private {audioCat.state.Track}
   */
  this.soloedTrack_ = null;
};
goog.inherits(audioCat.state.TrackManager, audioCat.utility.EventTarget);

/**
 * @return {audioCat.state.Track} The track that is solo-ed or null if none.
 */
audioCat.state.TrackManager.prototype.getSoloedTrack = function() {
  return this.soloedTrack_;
};

/**
 * Adds a track to the project. Throws a relevant event.
 * @param {!audioCat.state.Track} track The track to add.
 * @param {number=} opt_index The index at which to add the track. If not
 *     provided, then the track is added as the last track.
 */
audioCat.state.TrackManager.prototype.addTrack = function(track, opt_index) {
  var trackIndex = goog.isDef(opt_index) ? opt_index : this.tracks_.length;
  this.addTrackQuietly(track, trackIndex);
  this.dispatchEvent(new audioCat.state.TrackAddedEvent(track, trackIndex));
};

/**
 * Adds a track to the project without throwing a relevant event.
 * @param {!audioCat.state.Track} track The track to add.
 * @param {number=} opt_index The index at which to add the track. If not
 *     provided, then the track is added as the last track.
 */
audioCat.state.TrackManager.prototype.addTrackQuietly =
    function(track, opt_index) {
  var tracks = this.tracks_;
  var trackIndex = goog.isDef(opt_index) ? opt_index : tracks.length;
  goog.array.insertAt(tracks, track, trackIndex);
  // Unsolo other tracks if one track is soloed.
  goog.events.listen(track, audioCat.state.events.TRACK_SOLO_CHANGED,
      this.trackSoloStateChanged_, false, this);
};

/**
 * Handles what happens when the solo state of a track changes. Dispatches an
 * event when the currently solo-ed track is un-soloed or changed.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.state.TrackManager.prototype.trackSoloStateChanged_ = function(event) {
  var track = /** @type {!audioCat.state.Track} */ (event.target);
  if (!track.getSoloedState()) {
    // Only remove the currently solo-ed track if this event is for that track.
    if (!this.soloedTrack_ || track.getId() != this.soloedTrack_.getId()) {
      return;
    }
    this.soloedTrack_ = null;
    this.dispatchEvent(audioCat.state.events.SOLOED_TRACK_CHANGED);
    return;
  }
  // Ensure all other tracks are unsolo-ed.
  var tracks = this.tracks_;
  var numberOfTracks = tracks.length;

  // Set the solo-ed track.
  this.soloedTrack_ = track;

  for (var i = 0; i < numberOfTracks; ++i) {
    var currentTrack = tracks[i];
    if (currentTrack.getId() != track.getId()) {
      // Un-solo this track.
      currentTrack.setSoloedState(false);
    }
  }
  this.dispatchEvent(audioCat.state.events.SOLOED_TRACK_CHANGED);
};

/**
 * Removes a track.
 * @param {number} trackIndex The index of the track to remove.
 */
audioCat.state.TrackManager.prototype.removeTrack = function(trackIndex) {
  var tracks = this.tracks_;
  var trackRemoved = tracks[trackIndex];
  goog.array.removeAt(tracks, trackIndex);
  this.dispatchEvent(
      new audioCat.state.TrackRemovedEvent(trackIndex, trackRemoved));
};

/**
 * Removes all tracks.
 */
audioCat.state.TrackManager.prototype.removeAllTracks = function() {
  var tracks = this.tracks_;
  for (var i = tracks.length - 1; i >= 0; --i) {
    this.dispatchEvent(
      new audioCat.state.TrackRemovedEvent(i, tracks.pop()));
  }
};

/**
 * Removes a track given the track object.
 * @param {!audioCat.state.Track} track The track to remove.
 * @return {number} The index of the track that was removed or -1 if the track
 *     did not exist.
 */
audioCat.state.TrackManager.prototype.removeTrackGivenObject = function(track) {
  var tracks = this.tracks_;
  var numberOfTracks = tracks.length;
  for (var i = 0; i < numberOfTracks; ++i) {
    var currentTrack = tracks[i];
    if (currentTrack.getId() == track.getId()) {
      this.removeTrack(i);
      return i;
    }
  }
  return -1;
};

/**
 * Gets the track at a certain index.
 * @param {number} index The index of the track.
 * @return {!audioCat.state.Track} The track at the index.
 */
audioCat.state.TrackManager.prototype.getTrack = function(index) {
  return this.tracks_[index];
};

/**
 * @return {number} The current number of tracks for the project.
 */
audioCat.state.TrackManager.prototype.getNumberOfTracks = function() {
  return this.tracks_.length;
};

/**
 * Reverts the track manager to its original state. Used during undo. When we
 * try to undo certain pesky operations, we may just recreate a state from the
 * beginning.
 */
audioCat.state.TrackManager.prototype.revertToOpeningState = function() {
  // TODO(chizeng): Store and revert to the original track manager state.
};
