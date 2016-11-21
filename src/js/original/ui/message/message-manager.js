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
goog.provide('audioCat.ui.message.MessageManager');

goog.require('audioCat.ui.message.HideMessageEvent');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.ui.message.NewMessageEvent');
goog.require('audioCat.utility.EventTarget');


/**
 * Manages messages to be displayed to the user.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.message.MessageManager = function(idGenerator) {
  goog.base(this);

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;
};
goog.inherits(audioCat.ui.message.MessageManager, audioCat.utility.EventTarget);

/**
 * Issues a message.
 * @param {string} message The message.
 * @param {audioCat.ui.message.MessageType=} opt_type The type of message to
 *     dispatch. Defaults to an informative message.
 * @return {audioCat.utility.Id} The ID of the new message. Used to potentially
 *     hide the message later.
 */
audioCat.ui.message.MessageManager.prototype.issueMessage = function(
    message,
    opt_type) {
  var messageId = this.idGenerator_.obtainUniqueId();
  this.dispatchEvent(new audioCat.ui.message.NewMessageEvent(
      message,
      messageId,
      opt_type || audioCat.ui.message.MessageType.INFO));
  return messageId;
};

/**
 * Hides a message if it is still displayed. Otherwise, does nothing.
 * @param {audioCat.utility.Id} messageId The ID of the message to hide if it is
 *     still displayed.
 */
audioCat.ui.message.MessageManager.prototype.hideMessage = function(messageId) {
  this.dispatchEvent(new audioCat.ui.message.HideMessageEvent(messageId));
};
