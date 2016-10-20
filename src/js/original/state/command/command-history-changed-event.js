goog.provide('audioCat.state.command.CommandHistoryChangedEvent');

goog.require('audioCat.state.command.Event');
goog.require('audioCat.utility.Event');


/**
 * Event thrown when the command history changes.
 *
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.command.CommandHistoryChangedEvent = function() {
  goog.base(this, audioCat.state.command.Event.COMMAND_HISTORY_CHANGED);
};
goog.inherits(audioCat.state.command.CommandHistoryChangedEvent,
    audioCat.utility.Event);
