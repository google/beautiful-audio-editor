goog.provide('audioCat.state.command.ImportAudioCommand');

goog.require('audioCat.state.command.AddTrackCommand');
goog.require('goog.asserts');



/**
 * Imports audio from a file into a new track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {string} audioName The name of the imported audio.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing the
 *     imported audio.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.ImportAudioCommand =
    function(idGenerator, audioName, audioChest) {
  audioCat.state.command.ImportAudioCommand.base(
      this, 'constructor', idGenerator, audioName, audioChest);

  /**
   * The name of the imported audio.
   * @private {string}
   */
  this.audioName_ = audioName;
};
goog.inherits(audioCat.state.command.ImportAudioCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.ImportAudioCommand.prototype.getSummary =
    function(forward) {
  return (forward ?
      'Imported ' :
      'Removed imported section ') + this.audioName_ + '.';
};

/** @override */
audioCat.state.command.ImportAudioCommand.prototype.getMemoryAdded =
    function() {
  // We just added this much memory ...
  var audioChest = this.getOptionalAudioChest();
  goog.asserts.assert(audioChest);
  return audioChest.obtainTotalByteSize();
};
