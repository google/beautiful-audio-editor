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
goog.provide('audioCat.state.effect.HighPassFilter');

goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');


/**
 * An effect that filters out low frequencies and lets higher frequencies pass
 * without amplifying them.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_q The initial q value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.FilterEffect}
 */
audioCat.state.effect.HighPassFilter = function(
    effectModelController,
    idGenerator,
    opt_frequency,
    opt_q) {
  goog.base(this,
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.HIGHPASS),
      idGenerator,
      opt_frequency,
      opt_q);

  this.getFrequencyField().setDescription(
      'Frequencies below this cutoff are weakened.');

  // This filter has no use for a gain field.
  this.getGainField().setActiveState(false);
};
goog.inherits(
    audioCat.state.effect.HighPassFilter, audioCat.state.effect.FilterEffect);
