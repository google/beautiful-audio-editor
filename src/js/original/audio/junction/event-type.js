goog.provide('audioCat.audio.junction.EventType');


/**
 * Enumerates names of events fired by junctions. When adding a new entry,
 * increment the letter name below to maintain uniqueness.
 * Next available letter: 'c'
 * @enum {string}
 */
audioCat.audio.junction.EventType = {
  NEW_IMPULSE_RESPONSE_NEEDED: 'b',
  RECONNECT_REQUESTED: 'a' // A junction requests reconnect and restart.
};
