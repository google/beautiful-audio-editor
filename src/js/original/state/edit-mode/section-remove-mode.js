goog.provide('audioCat.state.editMode.SectionRemoveMode');

goog.require('audioCat.state.command.RemoveSectionFromTrackCommand');
goog.require('audioCat.state.editMode.EditMode');
goog.require('audioCat.state.editMode.EditModeName');


/**
 * The edit mode in which the user can remove sections from their tracks.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands, thus allowing for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.editMode.EditMode}
 */
audioCat.state.editMode.SectionRemoveMode =
    function(commandManager, idGenerator) {
  goog.base(this, audioCat.state.editMode.EditModeName.REMOVE_SECTION);

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Manages the history of commands.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;
};
goog.inherits(audioCat.state.editMode.SectionRemoveMode,
    audioCat.state.editMode.EditMode);

/**
 * Remove a section from its track.
 * @param {!audioCat.state.Section} section The section to delete.
 */
audioCat.state.editMode.SectionRemoveMode.prototype.removeSection =
    function(section) {
  var track = section.getTrack();
  if (!track) {
    // The section does not belong to a track. Nothing to do.
    return;
  }

  // TODO(chizeng): Ask the user to confirm if he/she really wants to remove the
  // section from the track.
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.RemoveSectionFromTrackCommand(
          track,
          section,
          this.idGenerator_));
};
