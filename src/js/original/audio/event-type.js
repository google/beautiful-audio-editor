goog.provide('audioCat.audio.EventType');


/**
 * Enumerates event types related to audio. After adding a new event, increment
 * the letter index below.
 * Next available letter: 'e'
 * @enum {string}
 */
audioCat.audio.EventType = {
  BEATS_IN_A_BAR_CHANGED: 'b',
  BEAT_UNIT_CHANGED: 'a',
  MASTER_GAIN_CHANGED: 'd',
  TEMPO_CHANGED: 'c'
};
