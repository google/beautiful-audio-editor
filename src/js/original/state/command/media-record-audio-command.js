goog.provide('audioCat.state.command.MediaRecordAudioCommand');

goog.require('audioCat.state.command.AddTrackCommand');
goog.require('goog.asserts');



/**
 * Records audio from some media source into a new track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing the
 *     imported audio.
 * @param {number=} opt_beginTime The number of seconds into the audio at which
 *     to begin the new section.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.MediaRecordAudioCommand =
    function(idGenerator, audioChest, opt_beginTime) {
  audioCat.state.command.MediaRecordAudioCommand.base(this, 'constructor',
      idGenerator, 'New Recording', audioChest, opt_beginTime);
};
goog.inherits(audioCat.state.command.MediaRecordAudioCommand,
    audioCat.state.command.AddTrackCommand);


/** @override */
audioCat.state.command.MediaRecordAudioCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Add' : 'Remov') + 'ed audio recording.';
};


/** @override */
audioCat.state.command.MediaRecordAudioCommand.prototype.getMemoryAdded =
    function() {
  // We just added this much memory ...
  var audioChest = this.getOptionalAudioChest();
  goog.asserts.assert(audioChest);
  return audioChest.obtainTotalByteSize();
};
