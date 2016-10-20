goog.provide('audioCat.state.command.Event');

/**
 * Enumerates types for events related to events. When you add a new event,
 * increment the index below. This may seem hacky, but I see no better way to
 * systematically maintain the uniqueness of the event types.
 * Next available index: 1
 * @enum {string}
 */
audioCat.state.command.Event = {
  COMMAND_HISTORY_CHANGED: '0'
};
