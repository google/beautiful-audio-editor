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
goog.provide('audioCat.state.effect.model.LowPassModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.LowPassFilter');


/**
 * A model that describes a lowpass filter effect.
 * Instances of lowpass filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.LowPassModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.LOWPASS,
      audioCat.state.effect.EffectCategory.FILTER,
      'lowpass',
      'lp',
      'Weakens high frequencies.');
};
goog.inherits(audioCat.state.effect.model.LowPassModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.LowPassModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.LowPassFilter(
      effectModelController, idGenerator);
};
