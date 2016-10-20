goog.provide('audioCat.audio.render.ExportWorkerMessageType');

/**
 * Enumerates message types that the worker for exporting could post. Increment
 * the value below upon adding a new value so as to maintain uniquness. However,
 * do not alter existing values; these values are hardcoded in workers since
 * we cannot import enums in worker functions. Increment the number below after
 * adding a new value to maintain uniqueness.
 * Next available number: 4
 * @enum {number}
 */
audioCat.audio.render.ExportWorkerMessageType = {
  DONE: 1,
  ERROR: 3,
  PROGRESS: 2
};
