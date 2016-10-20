goog.provide('audioCat.state.effect.EventType');


/**
 * Enumerates types of events related to effects. Increment the following letter
 * after adding an entry here to maintain unique names.
 * Next available letter: e
 */
audioCat.state.effect.EventType = {
  EFFECT_ADDED: 'a', // The effect manager dispatches this.
  EFFECT_HIGHLIGHTED_STATE_CHANTED: 'b', // The effect dispatches this.
  EFFECT_MOVED: 'c', // The effect manager dispatches this.
  EFFECT_REMOVED: 'd' // The effect manager dispatches this.
};
