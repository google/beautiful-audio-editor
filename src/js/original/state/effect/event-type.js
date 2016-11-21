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
goog.provide('audioCat.state.effect.EventType');


/**
 * Enumerates types of events related to effects. Increment the following letter
 * after adding an entry here to maintain unique names.
 * Next available letter: e
 */
audioCat.state.effect.EventType = {
  EFFECT_ADDED: 'a', // The effect manager dispatches this.
  EFFECT_HIGHLIGHTED_STATE_CHANTED: 'b', // The effect dispatches this.
  EFFECT_MOVED: 'c', // The effect manager dispatches this.
  EFFECT_REMOVED: 'd' // The effect manager dispatches this.
};
