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
goog.provide('audioCat.state.plan.EffectPlan');
goog.provide('audioCat.state.plan.EffectPlan.DynamicCompressionProperty');
goog.provide('audioCat.state.plan.EffectPlan.FilterProperty');
goog.provide('audioCat.state.plan.EffectPlan.GainProperty');
goog.provide('audioCat.state.plan.EffectPlan.PanProperty');
goog.provide('audioCat.state.plan.EffectPlan.SimpleReverbProperty');


/**
 * Describes how an effect should be stored.
 * @typedef {{
 *   1: audioCat.state.effect.EffectId
 * }}
 */
audioCat.state.plan.EffectPlan = {};

/** @type {number} */
audioCat.state.plan.EffectPlan.EFFECT_ID = 1;

/**
 * Enumerates fields related to filter effects.
 * @enum {number}
 */
audioCat.state.plan.EffectPlan.FilterProperty = {
  GAIN: 2,
  Q: 3,
  FREQUENCY: 4
};

/**
 * Enumerates fields related to dynamic compression.
 * @enum {number}
 */
audioCat.state.plan.EffectPlan.DynamicCompressionProperty = {
  ATTACK: 2,
  KNEE: 3,
  RATIO: 4,
  RELEASE: 5,
  THRESHOLD: 6
};

/**
 * Enumerates fields related to gain effects.
 * @enum {number}
 */
audioCat.state.plan.EffectPlan.GainProperty = {
  GAIN: 2
};

/**
 * Enumerates fields related to pan effects.
 * @enum {number}
 */
audioCat.state.plan.EffectPlan.PanProperty = {
  PAN: 2
};

/**
 * Enumerates fields related to simple reverb effects.
 * @enum {number}
 */
audioCat.state.plan.EffectPlan.SimpleReverbProperty = {
  DURATION: 2,
  DECAY: 3,
  REVERSED: 4
};
