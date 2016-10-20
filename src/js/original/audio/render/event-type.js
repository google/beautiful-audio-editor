goog.provide('audioCat.audio.render.EventType');


/**
 * Enumerates events related to rendering audio. After adding a new event,
 * increment the letter below.
 * Next Available Letter Index: 'd'
 * @enum {string}
 */
audioCat.audio.render.EventType = {
  AUDIO_RENDERED: 'a', // Audio has finished rendering.
  EXPORTING_BEGAN: 'b',
  EXPORTING_FAILED: 'c',
  EXPORTING_PROGRESS: 'd',
  EXPORTING_SUCCEEDED: 'e'
};
