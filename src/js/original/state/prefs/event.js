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
goog.provide('audioCat.state.prefs.Event');


/**
 * Enumerates events related to user preferences.
 * Next available character (increment upon adding new value): 'c'
 * @enum {string}
 */
audioCat.state.prefs.Event = {
  MP3_EXPORT_ENABLED_CHANGED: 'a',
  SCROLL_WHILE_PLAYING_ENABLED_CHANGED: 'b'
};
