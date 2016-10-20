goog.provide('audioCat.state.command.ChangeSoloTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Either solos or un-solos a track.
 * @param {!audioCat.state.Track} track The track to mute or unmute.
 * @param {boolean} soloState If true, the track is solo-ed. Otherwise, it is
 *     un-soloed.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeSoloTrackCommand = function(
    track,
    soloState,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track which had its mute state changed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The solo state into which the track entered.
   * @private {boolean}
   */
  this.soloState_ = soloState;
};
goog.inherits(audioCat.state.command.ChangeSoloTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setSoloedState(this.soloState_);
};

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setSoloedState(!(this.soloState_));
};

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'S' : 'Un-s') + 'oloed track ' +
      this.track_.getName() + '.';
};
