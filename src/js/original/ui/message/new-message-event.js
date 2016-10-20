goog.provide('audioCat.ui.message.NewMessageEvent');

goog.require('audioCat.ui.message.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event indicating that new message had just been issued.
 * @param {string} message The message.
 * @param {audioCat.utility.Id} messageId The ID of the issued message.
 * @param {audioCat.ui.message.MessageType} messageType The type of message to
 *     dispatch.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.message.NewMessageEvent = function(
    message,
    messageId,
    messageType) {
  goog.base(this, audioCat.ui.message.EventType.NEW_MESSAGE);

  /**
   * @private {string}
   */
  this.message_ = message;

  /**
   * @private {audioCat.utility.Id}
   */
  this.messageId_ = messageId;

  /**
   * @private {audioCat.ui.message.MessageType}
   */
  this.messageType_ = messageType;
};
goog.inherits(audioCat.ui.message.NewMessageEvent, audioCat.utility.Event);

/**
 * @return {string} The message.
 */
audioCat.ui.message.NewMessageEvent.prototype.getMessage = function() {
  return this.message_;
};

/**
 * @return {audioCat.utility.Id} The ID of the message.
 */
audioCat.ui.message.NewMessageEvent.prototype.getMessageId = function() {
  return this.messageId_;
};

/**
 * @return {audioCat.ui.message.MessageType} The type of message.
 */
audioCat.ui.message.NewMessageEvent.prototype.getMessageType = function() {
  return this.messageType_;
};
