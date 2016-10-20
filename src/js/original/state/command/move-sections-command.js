goog.provide('audioCat.state.command.MoveSectionsCommand');

goog.require('audioCat.state.command.Command');

/**
 * Command issued when sections are moved either individually or en masse.
 * @param {!Array.<!audioCat.state.editMode.MoveSectionEntry>} sectionEntries
 *     A list of entries containing info on the sections being moved as well as
 *     their new and original positions.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.MoveSectionsCommand = function(
    sectionEntries,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * Entries for sections being moved.
   * @private {!Array.<!audioCat.state.editMode.MoveSectionEntry>}
   */
  this.sectionEntries_ = sectionEntries;

  var tracks = [];
  var beginTimes = [];
  var numberOfSectionEntries = sectionEntries.length;
  for (var i = 0; i < numberOfSectionEntries; ++i) {
    var sectionEntry = sectionEntries[i];
    var section = sectionEntry.getSection();
    var track = section.getTrack();
    var beginTime = section.getBeginTime();
    tracks.push(track);
    beginTimes.push(beginTime);
  }

  /**
   * The tracks that the sections got moved into.
   * @private {!Array.<!audioCat.state.Track>}
   */
  this.tracks_ = tracks;

  /**
   * The begin times that the sections got changed to.
   * @private {!Array.<number>}
   */
  this.beginTimes_ = beginTimes;
};
goog.inherits(
    audioCat.state.command.MoveSectionsCommand, audioCat.state.command.Command);

/** @override */
audioCat.state.command.MoveSectionsCommand.prototype.perform =
    function(project, trackManager) {
  var sectionEntries = this.sectionEntries_;
  var numberOfSectionEntries = sectionEntries.length;
  var beginTimes = this.beginTimes_;
  var tracks = this.tracks_;
  for (var i = 0; i < numberOfSectionEntries; ++i) {
    var sectionEntry = sectionEntries[i];
    var section = sectionEntry.getSection();
    var trackToRemoveFrom = sectionEntry.getTrack();
    var trackToAddTo = tracks[i];
    if (trackToRemoveFrom.getId() != trackToAddTo.getId()) {
      // Remove from previous track. Add to new track.
      trackToRemoveFrom.removeSection(section);
      trackToAddTo.addSection(section);
    }
    // Set new begin time.
    section.setBeginTime(beginTimes[i]);
  }
};

/** @override */
audioCat.state.command.MoveSectionsCommand.prototype.undo =
    function(project, trackManager) {
  var sectionEntries = this.sectionEntries_;
  var numberOfSectionEntries = sectionEntries.length;
  var beginTimes = this.beginTimes_;
  var tracks = this.tracks_;
  for (var i = 0; i < numberOfSectionEntries; ++i) {
    var sectionEntry = sectionEntries[i];
    var section = sectionEntry.getSection();

    var trackToRemoveFrom = tracks[i];
    var trackToAddTo = sectionEntry.getTrack();
    if (trackToRemoveFrom.getId() != trackToAddTo.getId()) {
      // Remove from previous track. Add to new track.
      trackToRemoveFrom.removeSection(section);
      trackToAddTo.addSection(section);
    }
    // Set new begin time.
    section.setBeginTime(sectionEntry.getBeginTime());
  }
};

/** @override */
audioCat.state.command.MoveSectionsCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'Moved' : 'Un-moved') + ' section.';
};
