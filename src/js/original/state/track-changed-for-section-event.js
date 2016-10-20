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
