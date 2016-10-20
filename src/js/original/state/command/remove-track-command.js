goog.provide('audioCat.state.command.RemoveTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Removes a track.
 * @param {!audioCat.state.Track} track The track to remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveTrackCommand = function(
    track,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track to remove.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The index of the removed track. If null, the index had not been computed
   * yet. This means that the command had not been performed yet.
   * @private {?number}
   */
  this.trackIndex_ = null;

  /**
   * The solo-ed state of the track upon removal. This is important to note
   * since removing a solo-ed track means that the other tracks won't play. We
   * hence unsolo the track when it's removed. And then, if the track is ever
   * added back, we solo it.
   * @private {boolean}
   */
  this.soloedStateUponRemoval_ = track.getSoloedState();
};
goog.inherits(audioCat.state.command.RemoveTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.perform =
    function(project, trackManager) {
  var track = this.track_;
  if (this.soloedStateUponRemoval_) {
    // If we remove a solo-ed track, all the other tracks will be silent.
    // That's ... definitely not what we want.
    track.setSoloedState(false);
  }
  this.trackIndex_ = trackManager.removeTrackGivenObject(track);
};

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.undo =
    function(project, trackManager) {
  // The perform method of this function must have been executed before undo can
  // be executed.
  var track = this.track_;
  trackManager.addTrack(track, /** @type {number} */ (this.trackIndex_));
  track.setSoloedState(this.soloedStateUponRemoval_);
};

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'Remov' : 'Un-remov') + 'ed track ' +
      this.track_.getName() + '.';
};
