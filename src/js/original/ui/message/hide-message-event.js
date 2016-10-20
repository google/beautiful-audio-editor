goog.provide('audioCat.ui.message.HideMessageEvent');

goog.require('audioCat.ui.message.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event indicating that a message had been hidden.
 * @param {audioCat.utility.Id} messageId The ID of the message to hide.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.message.HideMessageEvent = function(messageId) {
  goog.base(this, audioCat.ui.message.EventType.HIDE_MESSAGE);

  /**
   * @private {audioCat.utility.Id}
   */
  this.messageId_ = messageId;
};
goog.inherits(audioCat.ui.message.HideMessageEvent, audioCat.utility.Event);

/**
 * @return {audioCat.utility.Id} The ID of the message to hide if it is shown.
 */
audioCat.ui.message.HideMessageEvent.prototype.getMessageId = function() {
  return this.messageId_;
};
