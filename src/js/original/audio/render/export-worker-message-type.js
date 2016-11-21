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
goog.provide('audioCat.audio.render.ExportWorkerMessageType');

/**
 * Enumerates message types that the worker for exporting could post. Increment
 * the value below upon adding a new value so as to maintain uniquness. However,
 * do not alter existing values; these values are hardcoded in workers since
 * we cannot import enums in worker functions. Increment the number below after
 * adding a new value to maintain uniqueness.
 * Next available number: 4
 * @enum {number}
 */
audioCat.audio.render.ExportWorkerMessageType = {
  DONE: 1,
  ERROR: 3,
  PROGRESS: 2
};
