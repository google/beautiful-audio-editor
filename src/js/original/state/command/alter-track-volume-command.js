goog.provide('audioCat.state.command.AlterTrackVolumeCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the overall volume of a track.
 * @param {!audioCat.state.Track} track The track to alter volume for.
 * @param {number} oldVolume A value from 0 to 1 denoting the old volume before
 *     this command was made.
 * @param {number} newVolume A value from 0 to 1 denoting the volume to set the
 *     track to.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterTrackVolumeCommand =
    function(track, oldVolume, newVolume) {
  // TODO(chizeng): Notify user which track was updated via a track index.
  goog.base(this, true);

  /**
   * The track to alter volume for.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The old volume of the track.
   * @private {number}
   */
  this.oldVolume_ = oldVolume;

  /**
   * The volume to set the track to.
   * @private {number}
   */
  this.newVolume_ = newVolume;
};
goog.inherits(audioCat.state.command.AlterTrackVolumeCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterTrackVolumeCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setGain(this.newVolume_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setGain(this.oldVolume_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeCommand.prototype.getSummary = function(
    forward) {
  var increaseState = this.newVolume_ > this.oldVolume_;
  var description = forward ?
      (increaseState ? 'Increased' : 'Decreased') + ' volume' :
      'Undid ' + (increaseState ? 'increase' : 'decrease') + ' in volume';
  return description + ' for track ' + this.track_.getName() + '.';
};
