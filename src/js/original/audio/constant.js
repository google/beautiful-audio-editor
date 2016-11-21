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
goog.provide('audioCat.audio.Constant');


/**
 * Enumerates numeric constants related to audio.
 * @enum {number}
 */
audioCat.audio.Constant = {
  DEFAULT_SAMPLE_RATE: 44100,
  LOG10: Math.log(10), // Used for computing decibels efficiently.
  MIN_PAN_DEGREES: -45,
  DEFAULT_PAN_DEGREES: 0,
  MAX_PAN_DEGREES: 45,

  MIN_VOLUME_DECIBELS: -60,
  DEFAULT_VOLUME_DECIBELS: 0,
  MAX_VOLUME_DECIBELS: 12,

  MIN_VOLUME_SAMPLE_UNITS: 0,

  DEFAULT_INPUT_CHANNEL_COUNT: 1,

  DEFAULT_OUTPUT_CHANNEL_COUNT: 2,

  DEFAULT_PLAYBACK_RATE: 1,

  // It can't be 0, but make it close!
  // TODO(chizeng): Rethink this. It's probs not what we want. A very miniscule
  // number means that we go to 0 gain very very quickly.
  MIN_VOLUME_FOR_EXPONENTIAL_RAMP: Math.pow(2, -100),

  DEFAULT_VOLUME_SAMPLE_UNITS: 1,
  MAX_VOLUME_SAMPLE_UNITS: 2,

  DEFAULT_TEMPO: 120,

  DEFAULT_FILTER_FREQUENCY: 1300,
  DEFAULT_FILTER_Q: 8.6,
  DEFAULT_FILTER_GAIN: 3.12,

  ANALYSER_FFT_SIZE: 512, // This makes for a frequency bin count of 256.
  MIN_FREQUENCY_BIN_AMPLITUDE: 0,
  MAX_FREQUENCY_BIN_AMPLITUDE: 255,
  ANALYSER_BUFFER_SIZE: 256, // Keep this 1/2 of ANALYSER_FFT_SIZE.
  ANALYSER_TIME_DOMAIN_BYTE_DATA_SIZE: 256, // Keep this 1/2 ANALYSER_FFT_SIZE.

  ANALYSER_TIME_DOMAIN_BYTE_MIN_VALUE: 128,
  ANALYSER_TIME_DOMAIN_BYTE_MAX_VALUE: 255,
  ANALYSER_TIME_DOMAIN_VALUE_RANGE: 127,

  // The decibel range for not.
  MIN_VISUALIZATION_DECIBELS: -150,
  MAX_VISUALIZATION_DECIBELS: 0,

  // How much smoothing to apply for visualizing the frequency spectrum.
  ANALYSER_SMOOTHING: 0,

  // The parameters for the gain effect.
  GAIN_EFFECT_DEFAULT: 0,
  GAIN_EFFECT_MIN: -60,
  GAIN_EFFECT_MAX: 24,

  // The parameters for a filter effect.
  FILTER_EFFECT_FREQUENCY_MIN: 10,
  FILTER_EFFECT_FREQUENCY_MAX: 22050,

  FILTER_EFFECT_Q_MIN: 0,
  FILTER_EFFECT_Q_MAX: 20,

  FILTER_EFFECT_GAIN_MIN: -36,
  FILTER_EFFECT_GAIN_MAX: 36,

  // The parameters for dynamic compression.
  DYNAMIC_COMPRESSOR_ATTACK_DEFAULT: 0.009,
  DYNAMIC_COMPRESSOR_ATTACK_MIN: 0,
  DYNAMIC_COMPRESSOR_ATTACK_MAX: 1,

  DYNAMIC_COMPRESSOR_KNEE_DEFAULT: 30,
  DYNAMIC_COMPRESSOR_KNEE_MIN: 0,
  DYNAMIC_COMPRESSOR_KNEE_MAX: 40,

  DYNAMIC_COMPRESSOR_RATIO_DEFAULT: 12,
  DYNAMIC_COMPRESSOR_RATIO_MIN: 1,
  DYNAMIC_COMPRESSOR_RATIO_MAX: 20,

  DYNAMIC_COMPRESSOR_RELEASE_DEFAULT: 0.250,
  DYNAMIC_COMPRESSOR_RELEASE_MIN: 0.001,
  DYNAMIC_COMPRESSOR_RELEASE_MAX: 1,

  DYNAMIC_COMPRESSOR_THRESHOLD_DEFAULT: -24,
  DYNAMIC_COMPRESSOR_THRESHOLD_MIN: -100,
  DYNAMIC_COMPRESSOR_THRESHOLD_MAX: 0,

  // Parameters for a simple reverb.
  REVERB_DURATION_MIN: 100, // ms
  REVERB_DURATION_MAX: 10000, // ms
  REVERB_DURATION_DEFAULT: 2000, // ms

  REVERB_DECAY_MIN: 100, // ms
  REVERB_DECAY_MAX: 10000, // ms
  REVERB_DECAY_DEFAULT: 2000 // ms
};
