goog.provide('audioCat.audio.render.ExceptionType');


/**
 * Enumerates types of exceptions that can be thrown that are related to
 * rendering. Increment the index below after adding a new exception.
 * Next available index: 4
 * @enum {number}
 */
audioCat.audio.render.ExceptionType = {
  NO_TRACKS_TO_RENDER: 1, // No tracks to render.
  TRACK_SILENT: 2, // The projet's single track is silent.
  TRACKS_SILENT: 3 // The tracks are silent.
};
