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
goog.provide('audioCat.state.editMode.EditModeName');

/**
 * Enumerates names of edit modes. Represented by integers for quick testing of
 * equality. When adding a new edit mode, increment the index below. Do not use
 * 0 since 0 is falsy.
 * Next Available Index: 5
 * @enum {number}
 */
audioCat.state.editMode.EditModeName = {
  DUPLICATE_SECTION: 4,
  REMOVE_SECTION: 3,
  SELECT: 1,
  SPLIT_SECTION: 2
};
