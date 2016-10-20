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
