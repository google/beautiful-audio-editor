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
goog.provide('audioCat.audio.junction.EventType');


/**
 * Enumerates names of events fired by junctions. When adding a new entry,
 * increment the letter name below to maintain uniqueness.
 * Next available letter: 'c'
 * @enum {string}
 */
audioCat.audio.junction.EventType = {
  NEW_IMPULSE_RESPONSE_NEEDED: 'b',
  RECONNECT_REQUESTED: 'a' // A junction requests reconnect and restart.
};
