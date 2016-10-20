goog.provide('audioCat.state.editMode.EditModeName');

/**
 * Enumerates names of edit modes. Represented by integers for quick testing of
 * equality. When adding a new edit mode, increment the index below. Do not use
 * 0 since 0 is falsy.
 * Next Available Index: 5
 * @enum {number}
 */
audioCat.state.editMode.EditModeName = {
  DUPLICATE_SECTION: 4,
  REMOVE_SECTION: 3,
  SELECT: 1,
  SPLIT_SECTION: 2
};
