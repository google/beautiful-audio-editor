goog.provide('audioCat.state.command.RenderAudioToNewTrackCommand');

goog.require('audioCat.state.command.AddTrackCommand');
goog.require('goog.asserts');



/**
 * Renders collective current project audio into a new track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing the
 *     imported audio.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.RenderAudioToNewTrackCommand =
    function(idGenerator, audioChest) {
  goog.base(this, idGenerator, 'Rendered Audio', audioChest);
};
goog.inherits(audioCat.state.command.RenderAudioToNewTrackCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.RenderAudioToNewTrackCommand.prototype.getSummary =
    function(forward) {
  return forward ? 'Rendered audio into track.' : 'Removed rendered audio.';
};


/** @override */
audioCat.state.command.RenderAudioToNewTrackCommand.prototype.getMemoryAdded =
    function() {
  // We just added this much memory ...
  var audioChest = this.getOptionalAudioChest();
  goog.asserts.assert(audioChest);
  return audioChest.obtainTotalByteSize();
};
