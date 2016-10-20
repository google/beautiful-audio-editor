goog.provide('audioCat.state.command.AlterTrackVolumeDecibelsCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the overall volume of a track in decibels.
 * @param {!audioCat.state.Track} track The track to alter volume for.
 * @param {number} oldVolumeInDecibels The previous volume in dB.
 * @param {number} newVolumeInDecibels The new volume in dB.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterTrackVolumeDecibelsCommand =
    function(track, oldVolumeInDecibels, newVolumeInDecibels, idGenerator) {
  // TODO(chizeng): Notify user which track was updated via a track index.
  goog.base(this, idGenerator, true);

  /**
   * The track to alter volume for.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The previous volume of the track (dB).
   * @private {number}
   */
  this.oldVolumeInDecibels_ = oldVolumeInDecibels;

  /**
   * The volume to set the track to (dB).
   * @private {number}
   */
  this.newVolumeInDecibels_ = newVolumeInDecibels;
};
goog.inherits(audioCat.state.command.AlterTrackVolumeDecibelsCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setGainInDecibels(this.newVolumeInDecibels_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setGainInDecibels(this.oldVolumeInDecibels_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.getSummary =
    function(forward) {
  var increaseState = this.newVolumeInDecibels_ > this.oldVolumeInDecibels_;
  var description = forward ?
      (increaseState ? 'Increased' : 'Decreased') + ' volume' :
      'Undid ' + (increaseState ? 'increase' : 'decrease') + ' in volume';
  return description + ' for track ' + this.track_.getName() + '.';
};
