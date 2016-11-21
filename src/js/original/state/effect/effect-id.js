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
goog.provide('audioCat.state.effect.EffectId');


/**
 * Enumerates the IDs of effects. Each effect implemented throughout the
 * application must have a unique ID, not just each effect within a category.
 * Increment the number here upon adding a new entry.
 * Next available index: 14
 * @enum {number}
 */
audioCat.state.effect.EffectId = {
  LOWPASS: 1,
  HIGHPASS: 2,
  BANDPASS: 3,
  LOWSHELF: 4,
  HIGHSHELF: 5,
  PEAKING: 6,
  NOTCH: 7,
  ALLPASS: 8,
  COMPRESSOR: 9,
  GAIN: 10,
  DYNAMIC_COMPRESSOR: 11,
  PAN: 12,
  REVERB: 13
};
