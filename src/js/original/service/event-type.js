goog.provide('audioCat.service.EventType');


/**
 * Enumerates types of events related to services. When adding a new event,
 * increment the letter to maintain uniqueness.
 * Next available letter: 'd'
 * @enum {string}
 */
audioCat.service.EventType = {
  MAIN_SERVICE_CHANGED: 'a',
  OPEN_DOCUMENT_CHANGED: 'c',
  SHOULD_SAVE_STATE_CHANGED: 'b'
};
