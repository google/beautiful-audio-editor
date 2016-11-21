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
goog.provide('audioCat.state.effect.model.ReverbModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.ReverbEffect');


/**
 * A model that describes an effect for introducing simple reverb.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.ReverbModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.REVERB,
      audioCat.state.effect.EffectCategory.REVERB,
      'reverb',
      'r',
      'Introduces reverb.');
};
goog.inherits(audioCat.state.effect.model.ReverbModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.ReverbModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.ReverbEffect(
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.REVERB),
      idGenerator);
};
