goog.provide('audioCat.state.envelope.events');


/**
 * Enumerates envelope-related events. After adding a new entry, increment the
 * following character.
 * Next available character: 'd'
 * @enum {string}
 */
audioCat.state.envelope.events = {
  CONTROL_POINT_CHANGED: 'a', // Fired by a control point when it's changed.
  CONTROL_POINTS_CHANGED: 'b' // Fired by an envelope when its points changed.
};
