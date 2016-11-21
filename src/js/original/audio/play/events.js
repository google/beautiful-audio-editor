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
goog.provide('audioCat.audio.play.events');


/**
 * Enumerates events associated with playing audio. When adding a new event,
 * increment the following letter.
 * Next available letter/index: f
 * @enum {string}
 */
audioCat.audio.play.events = {
  INDICATED_TIME_CHANGED: 'd', // The time displayed to the user changed.
  PAUSED: 'c',
  PLAY_BEGAN: 'b',
  PLAY_TIME_CHANGED: 'a', // Play time changed while not playing.
  STABLE_TIME_CHANGED: 'e' // The time affecting playing changed.
};
