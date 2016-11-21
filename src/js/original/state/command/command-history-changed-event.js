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
