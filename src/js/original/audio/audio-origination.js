goog.provide('audioCat.audio.AudioOrigination');


/**
 * Enumerates various sources of audio. When adding a new enum value, increment
 * the index below to ensure that all values remain unique.
 * Next available index: 4
 * @enum {number}
 */
audioCat.audio.AudioOrigination = {
  IMPORTED: 1, // Imported audio are unaffected by changes in tempo.
  RECORDED: 2, // Audio was recorded. Will be affected by changes in tempo.
  RENDERED: 3 // Audio was rendered.
};
