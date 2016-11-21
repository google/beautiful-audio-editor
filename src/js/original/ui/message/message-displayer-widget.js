/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audioCat.ui.message.MessageDisplayerWidget');

goog.require('audioCat.ui.message.EventType');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.asserts');
goog.require('goog.dom.classes');


/**
 * A widget that displays messages to the user. Much of this widget may be
 * hidden throughout the lifetime of the application since the user only sees
 * parts of it when messages are displayed.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.message.MessageManager} messageManager Manages messages.
 *     Notifies this widget when new messages are issued.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.message.MessageDisplayerWidget = function(
    domHelper,
    messageManager) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  var element = domHelper.createDiv(goog.getCssName('messageDisplayerWidget'));
  goog.base(this, element);

  var messageTypeController = domHelper.createDiv();
  /**
   * Altering the class of this element lets us alter the display of the
   * message.
   * @private {!Element}
   */
  this.messageTypeController_ = messageTypeController;
  domHelper.appendChild(element, messageTypeController);

  var messageBox = domHelper.createDiv(goog.getCssName('messageBox'));
  /**
   * The element for the message that's actually displayed.
   * @private {!Element}
   */
  this.messageBox_ = messageBox;
  domHelper.appendChild(messageTypeController, messageBox);

  /**
   * The element that actually contains the text for the message.
   * @private {!Element}
   */
  this.messageTextContainer_ = domHelper.createDiv(
      goog.getCssName('textContainer'));
  domHelper.appendChild(messageBox, this.messageTextContainer_);

  // Create a button for hiding the message.
  var closeButton = domHelper.createDiv(goog.getCssName('closeButton'));
  domHelper.setRawInnerHtml(closeButton, '&#10005;');
  domHelper.appendChild(messageBox, closeButton);
  domHelper.listenForUpPress(closeButton, this.hideMessage_, false, this);

  /**
   * The timer handle for the previously scheduled hide message operation. -1 if
   * none.
   * @private {number}
   */
  this.timerHandle_ = -1;

  /**
   * The ID of the currently displayed message. -1 if no message displayed. Used
   * for hiding the message before it is scheduled to be hidden.
   * @private {number}
   */
  this.currentMessageId_ = -1;

  // TODO(chizeng): Create a close button that hides the message.

  // Listen to the message manager for new messages to display.
  messageManager.listen(audioCat.ui.message.EventType.NEW_MESSAGE,
      this.handleNewMessageReceived_, false, this);

  // Listen for requests to hide messages if they are shown.
  messageManager.listen(audioCat.ui.message.EventType.HIDE_MESSAGE,
      this.handleHideMessageEvent_, false, this);
};
goog.inherits(audioCat.ui.message.MessageDisplayerWidget,
    audioCat.ui.widget.Widget);

/**
 * Handles what happens when the widget receives a new message to display.
 * @param {!audioCat.ui.message.NewMessageEvent} event The associated event.
 * @private
 */
audioCat.ui.message.MessageDisplayerWidget.prototype.handleNewMessageReceived_ =
    function(event) {
  // TODO(chizeng): Figure out if you need to queue messages.
  this.displayMessage_(
      event.getMessage(),
      event.getMessageType(),
      event.getMessageId());
};

/**
 * Handles what happens when there's a request to hide a message.
 * @param {!audioCat.ui.message.HideMessageEvent} event The associated event.
 * @private
 */
audioCat.ui.message.MessageDisplayerWidget.prototype.handleHideMessageEvent_ =
    function(event) {
  if (this.currentMessageId_ == event.getMessageId()) {
    this.hideMessage_();
  }
};

/**
 * Displays the message given the string and type of message.
 * @param {string} message The message to display.
 * @param {audioCat.ui.message.MessageType} messageType The type of message to
 *     display.
 * @param {audioCat.utility.Id} messageId The ID of the message. Used to hide
 *     the message.
 * @private
 */
audioCat.ui.message.MessageDisplayerWidget.prototype.displayMessage_ =
    function(message, messageType, messageId) {
  // TODO(chizeng): Actually display the message.

  // Hide the existing message if it exists.
  this.hideMessage_();

  // Set the correct class depending on the type of the message.
  var messageClass;
  var messageTypeEnum = audioCat.ui.message.MessageType;
  switch (messageType) {
    case messageTypeEnum.DANGER:
      messageClass = goog.getCssName('dangerMessage');
      break;
    case messageTypeEnum.INFO:
      messageClass = goog.getCssName('infoMessage');
      break;
    case messageTypeEnum.SUCCESS:
      messageClass = goog.getCssName('successMessage');
      break;
    case messageTypeEnum.WARNING:
      messageClass = goog.getCssName('warningMessage');
      break;
  }
  goog.asserts.assert(messageClass);
  this.messageTypeController_.className = messageClass;

  // Set the message text.
  var domHelper = this.domHelper_;
  domHelper.setRawInnerHtml(this.messageTextContainer_, message);

  // Show the whole widget.
  goog.dom.classes.remove(
      this.getDom(), goog.getCssName('hiddenMessageDisplayerWidget'));

  // Make the message shown.
  goog.dom.classes.add(this.messageBox_, goog.getCssName('shown'));

  // Maybe hide message in 4 seconds at max?
  this.timerHandle_ = goog.global.setTimeout(
      goog.bind(this.hideMessage_, this), 4000);

  this.currentMessageId_ = messageId;
};

/**
 * Hides the current message if there is one shown. Otherwise, silently fails.
 * @private
 */
audioCat.ui.message.MessageDisplayerWidget.prototype.hideMessage_ = function() {
  if (this.timerHandle_ != -1) {
    // Prevent overlapping hide message operations.
    goog.global.clearTimeout(this.timerHandle_);
    this.timerHandle_ = -1;
    this.currentMessageId_ = -1;
    goog.dom.classes.remove(this.messageBox_, goog.getCssName('shown'));
    goog.dom.classes.add(
      this.getDom(), goog.getCssName('hiddenMessageDisplayerWidget'));
  }
};
