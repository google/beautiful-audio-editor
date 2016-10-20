goog.provide('audioCat.state.editMode.SelectionChangedEvent');

goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.utility.Event');


/**
 * Fired when the selected sections changes.
 * @param {!Array.<!audioCat.state.editMode.MoveSectionEntry>} selectedSections
 *     The list of selected sections.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.editMode.SelectionChangedEvent = function(selectedSections) {
  goog.base(this, audioCat.state.editMode.Events.SELECTION_CHANGED);

  /**
   * A list of selected sections.
   * @private {!Array.<!audioCat.state.editMode.MoveSectionEntry>}
   */
  this.selectedSections_ = selectedSections;
};
goog.inherits(
    audioCat.state.editMode.SelectionChangedEvent, audioCat.utility.Event);

/**
 * @return {!Array.<!audioCat.state.editMode.MoveSectionEntry>} The list of
 *     selected sections.
 */
audioCat.state.editMode.SelectionChangedEvent.prototype.getSelectedSections =
    function() {
  return this.selectedSections_;
};
