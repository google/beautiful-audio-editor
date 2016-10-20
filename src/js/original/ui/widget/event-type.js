goog.provide('audioCat.ui.widget.EventType');


/**
 * Enumerates events fired by widgets. Increment the letter index below when you
 * add a new event.
 * Next available letter: 'e'
 * @enum {string}
 */
audioCat.ui.widget.EventType = {
  DEFAULT_RECORDING_STARTED: 'a',
  DEFAULT_RECORDING_STOPPED: 'b',
  BOOLEAN_TOGGLED: 'c',
  SELECTION_CHANGED: 'd'
};
