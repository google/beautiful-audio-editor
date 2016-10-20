goog.provide('audioCat.state.command.CreateEmptyTrackCommand');

goog.require('audioCat.state.command.AddTrackCommand');


/**
 * Creates a new empty track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.CreateEmptyTrackCommand = function(idGenerator) {
  goog.base(this, idGenerator, 'New Track', undefined);
};
goog.inherits(audioCat.state.command.CreateEmptyTrackCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.CreateEmptyTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Added' : 'Removed') + ' new track.';
};
