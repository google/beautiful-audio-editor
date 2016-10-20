goog.provide('audioCat.ui.tracks.effect.EventType');


/**
 * Enumerates types of events related to UI pertaining to effects. Upon adding a
 * new value, increment the following letter.
 * Next available letter: c
 * @enum {string}
 */
audioCat.ui.tracks.effect.EventType = {
  REQUEST_DELETE_EFFECT: 'a', // A chip requests its effect be deleted.
  CHIP_TAPPED: 'b'
};
