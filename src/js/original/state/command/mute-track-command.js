goog.provide('audioCat.state.command.ChangeMuteTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Either mutes or unmutes a track.
 * @param {!audioCat.state.Track} track The track to mute or unmute.
 * @param {boolean} muteState If true, the track is muted. Otherwise, it is
 *     unmuted.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeMuteTrackCommand = function(
    track,
    muteState,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track which had its mute state changed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The mute state into which the track entered. If true, the track was muted.
   * Otherwise, the track was un-muted.
   * @private {boolean}
   */
  this.muteState_ = muteState;
};
goog.inherits(audioCat.state.command.ChangeMuteTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setMutedState(this.muteState_);
};

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setMutedState(!(this.muteState_));
};

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Muted' : 'Un-muted') +
      ' track ' + this.track_.getName() + '.';
};
