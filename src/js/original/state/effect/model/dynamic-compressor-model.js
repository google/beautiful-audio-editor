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
goog.provide('audioCat.state.effect.model.DynamicCompressorModel');

goog.require('audioCat.state.effect.DynamicCompressorEffect');
goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');


/**
 * A model that describes an effect that compresses magnitudes so that we make
 * maximal use of the volume range.s
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.DynamicCompressorModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR,
      audioCat.state.effect.EffectCategory.GAIN,
      'dynamic compressor',
      'dc',
      'Weakens loud parts, and loudens the soft parts, ' +
          'thus making greater use of volume range. Can prevent clipping.');
};
goog.inherits(audioCat.state.effect.model.DynamicCompressorModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.DynamicCompressorModel.prototype.
    createDefaultEffect = function(effectModelController, idGenerator) {
  return new audioCat.state.effect.DynamicCompressorEffect(
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR),
      idGenerator);
};
