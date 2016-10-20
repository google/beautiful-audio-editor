goog.provide('audioCat.state.command.AddTrackCommand');

goog.require('audioCat.state.Clip');
goog.require('audioCat.state.Section');
goog.require('audioCat.state.Track');
goog.require('audioCat.state.command.Command');


/**
 * Adds a new track. The subclass for a lot of other commands that involve
 * adding a class.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {string} trackName The name of the new track.
 * @param {!audioCat.audio.AudioChest=} opt_audioChest The chest containing the
 *     audio for the track. If not provided, creates an empty track.
 * @param {number=} opt_beginTime The number of seconds into the audio at which
 *     to begin the new section. Defaults to 0.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AddTrackCommand =
    function(idGenerator, trackName, opt_audioChest, opt_beginTime) {
  goog.base(this, idGenerator, true);

  /**
   * The name of the imported audio.
   * @private {string}
   */
  this.trackName_ = trackName;

  /**
   * The audio chest containing the full audio data for the imported audio. Or
   * null if no such audio exist, ie an empty track.
   * @private {audioCat.audio.AudioChest}
   */
  this.audioChest_ = opt_audioChest || null;

  /**
   * The index of the new track. Null if command not yet performed.
   * @private {?number}
   */
  this.trackIndex_ = null;

  // Create track.
  var track = new audioCat.state.Track(idGenerator, trackName);

  if (opt_audioChest) {
    // Create a section.
    var section = new audioCat.state.Section(
        idGenerator, opt_audioChest, trackName, opt_beginTime || 0);

    // Create a clip.
    var clip = new audioCat.state.Clip(
        idGenerator, 0, opt_audioChest.getNumberOfSamples());
    section.addClip(clip);
    track.addSection(section);
  }

  /**
   * The track added due to the audio import.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;
};
goog.inherits(
    audioCat.state.command.AddTrackCommand, audioCat.state.command.Command);

/** @override */
audioCat.state.command.AddTrackCommand.prototype.perform =
    function(project, trackManager) {
  // Remember the index at which we inserted this track.
  this.trackIndex_ = trackManager.getNumberOfTracks();
  trackManager.addTrack(this.track_);
};

/** @override */
audioCat.state.command.AddTrackCommand.prototype.undo =
    function(project, trackManager) {
  trackManager.removeTrack(/** @type {number} */ (this.trackIndex_));
  return;
};

/** @override */
audioCat.state.command.AddTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Added' : 'Removed') + ' track ' + this.track_.getName();
};

/**
 * @return {?audioCat.audio.AudioChest} The audio chest if any. Could be null
 *     if track added was empty.
 */
audioCat.state.command.AddTrackCommand.prototype.getOptionalAudioChest =
    function() {
  return this.audioChest_;
};
