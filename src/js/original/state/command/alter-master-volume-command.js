goog.provide('audioCat.state.command.AlterMasterVolumeCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the master volume of the project.
 * @param {!audioCat.audio.AudioGraph} audioGraph Hooks up audio components.
 * @param {number} previousVolume The master volume before this command.
 * @param {number} volume The new master volume after this command.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterMasterVolumeCommand =
    function(audioGraph, previousVolume, volume) {
  goog.base(this, true);

  /**
   * Organizes the audio nodes.
   * @private {!audioCat.audio.AudioGraph}
   */
  this.audioGraph_ = audioGraph;

  /**
   * The previous master volume.
   * @private {number}
   */
  this.previousVolume_ = previousVolume;

  /**
   * The new master volume that this command sets.
   * @private {number}
   */
  this.volume_ = volume;
};
goog.inherits(audioCat.state.command.AlterMasterVolumeCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterMasterVolumeCommand.prototype.perform =
    function(project, trackManager) {
  this.audioGraph_.setMasterGain(this.volume_);
};

/** @override */
audioCat.state.command.AlterMasterVolumeCommand.prototype.undo =
    function(project, trackManager) {
  this.audioGraph_.setMasterGain(this.previousVolume_);
};

/** @override */
audioCat.state.command.AlterMasterVolumeCommand.prototype.getSummary =
    function(forward) {
  var previousVolume = this.previousVolume_;
  var volume = this.volume_;
  return forward ?
    ((volume > previousVolume) ? 'Increased' : 'Decreased') + ' volume.' :
    'Undid volume ' + ((volume > previousVolume) ? 'increase.' : 'decrease.');
};

