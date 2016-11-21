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
goog.provide('audioCat.state.effect.PeakingFilter');

goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');


/**
 * Boost frequencies within a certain range.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_q The initial q value. Optional.
 * @param {number=} opt_gain The initial gain value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.FilterEffect}
 */
audioCat.state.effect.PeakingFilter = function(
    effectModelController,
    idGenerator,
    opt_frequency,
    opt_q,
    opt_gain) {
  goog.base(this,
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.PEAKING),
      idGenerator,
      opt_frequency,
      opt_q,
      opt_gain);

  this.getFrequencyField().setDescription(
      'Centers the range over this frequency.');

  this.getQField().setDescription(
      'Smaller Q values yield larger frequency ranges.');
};
goog.inherits(
    audioCat.state.effect.PeakingFilter, audioCat.state.effect.FilterEffect);
