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
goog.provide('audioCat.audio.render.ExceptionType');


/**
 * Enumerates types of exceptions that can be thrown that are related to
 * rendering. Increment the index below after adding a new exception.
 * Next available index: 4
 * @enum {number}
 */
audioCat.audio.render.ExceptionType = {
  NO_TRACKS_TO_RENDER: 1, // No tracks to render.
  TRACK_SILENT: 2, // The projet's single track is silent.
  TRACKS_SILENT: 3 // The tracks are silent.
};
