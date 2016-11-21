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
goog.provide('audioCat.state.envelope.ControlPointChange');


/**
 * Enumerates possible types of changes to the control points in an envelope.
 * Increment the following index after adding a new entry.
 * Next Available Index: 4
 * @enum {number}
 */
audioCat.state.envelope.ControlPointChange = {
  ADDED: 2,
  // Indicates that control points were modified, but not added or removed.
  MODIFIED: 1,
  REMOVED: 3
};
