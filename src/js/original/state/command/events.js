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
