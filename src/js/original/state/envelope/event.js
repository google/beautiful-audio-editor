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
goog.provide('audioCat.state.envelope.events');


/**
 * Enumerates envelope-related events. After adding a new entry, increment the
 * following character.
 * Next available character: 'd'
 * @enum {string}
 */
audioCat.state.envelope.events = {
  CONTROL_POINT_CHANGED: 'a', // Fired by a control point when it's changed.
  CONTROL_POINTS_CHANGED: 'b' // Fired by an envelope when its points changed.
};
