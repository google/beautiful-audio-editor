goog.provide('audioCat.state.envelope.ControlPointChange');


/**
 * Enumerates possible types of changes to the control points in an envelope.
 * Increment the following index after adding a new entry.
 * Next Available Index: 4
 * @enum {number}
 */
audioCat.state.envelope.ControlPointChange = {
  ADDED: 2,
  // Indicates that control points were modified, but not added or removed.
  MODIFIED: 1,
  REMOVED: 3
};
