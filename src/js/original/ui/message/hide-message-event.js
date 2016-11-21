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
