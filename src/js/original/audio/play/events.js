goog.provide('audioCat.audio.play.events');


/**
 * Enumerates events associated with playing audio. When adding a new event,
 * increment the following letter.
 * Next available letter/index: f
 * @enum {string}
 */
audioCat.audio.play.events = {
  INDICATED_TIME_CHANGED: 'd', // The time displayed to the user changed.
  PAUSED: 'c',
  PLAY_BEGAN: 'b',
  PLAY_TIME_CHANGED: 'a', // Play time changed while not playing.
  STABLE_TIME_CHANGED: 'e' // The time affecting playing changed.
};
