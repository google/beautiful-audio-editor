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
