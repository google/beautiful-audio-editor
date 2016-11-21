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
goog.provide('audioCat.state.effect.model.PanModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.PanEffect');


/**
 * A model that describes an effect for panning.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.PanModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.PAN,
      audioCat.state.effect.EffectCategory.GAIN,
      'pan',
      'p',
      'Pans left or right.');
};
goog.inherits(audioCat.state.effect.model.PanModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.PanModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.PanEffect(
      effectModelController.getModelFromId(audioCat.state.effect.EffectId.PAN),
      idGenerator);
};
