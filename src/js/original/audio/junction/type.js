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
goog.provide('audioCat.audio.junction.Type');


/**
 * Enumerates types of junctions. Increment the following index when a new type
 * of junction is added.
 * Next available integer: 19
 * @enum {number}
 */
audioCat.audio.junction.Type = {
  ANALYSER: 4,
  CHANNEL_SPLITTER: 17,
  CLIP: 5,
  CONVOLVER: 18,
  DELAY: 8,
  DESTINATION: 7,
  DYNAMIC_COMPRESSOR: 16,
  EFFECT_MANAGER: 13,
  FILTER_EFFECT: 14,
  GAIN: 2,
  GAIN_EFFECT: 15,
  MEDIA_SOURCE: 11,
  PAN: 3,
  PAN_ENVELOPE: 10,
  SECTION: 6,
  SCRIPT_PROCESSOR: 12,
  TRACK: 1,
  VOLUME_ENVELOPE: 9
};
