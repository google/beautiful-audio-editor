goog.provide('audioCat.state.command.RemoveSectionFromTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Removes a section from its track.
 * @param {!audioCat.state.Track} track The track from which to remove the
 *     section.
 * @param {!audioCat.state.Section} section The section to remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveSectionFromTrackCommand = function(
    track,
    section,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track from which the section was removed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The section removed.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;
};
goog.inherits(audioCat.state.command.RemoveSectionFromTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.removeSection(this.section_);
};

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.addSection(this.section_);
};

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Remov' : 'Add') + 'ed section ' +
      (forward ? 'from' : 'to') + ' track ' + this.track_.getName() + '.';
};
