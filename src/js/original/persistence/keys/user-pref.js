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
goog.provide('audioCat.persistence.keys.UserPref');

/**
 * Enumerates keys in the user pref local storage namespace. Data is stored in
 * local storage in the format "namespace-key".
 * Next available letter (increment upon adding a new entry): 'c'
 * @enum {string}
 */
audioCat.persistence.keys.UserPref = {
  MP3_EXPORT_ENABLED: 'a',
  SCROLL_WHILE_PLAYING_ENABLED: 'b'
};
