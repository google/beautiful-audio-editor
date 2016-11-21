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
goog.provide('audioCat.state.effect.GainEffect');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.effect.Effect');
goog.require('audioCat.state.effect.field.GradientField');
goog.require('audioCat.utility.Unit');


/**
 * An effect that alters gain.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_gain The initial gain value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.Effect}
 */
audioCat.state.effect.GainEffect = function(
    model,
    idGenerator,
    opt_gain) {
  goog.base(this, model, idGenerator);

  /**
   * The field that controls gain.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.gainField_ = new audioCat.state.effect.field.GradientField(
      'gain', // The name of the field.
      'The gain to apply.', // Description.
      audioCat.utility.Unit.DB,
      audioCat.audio.Constant.GAIN_EFFECT_MIN, // Minimum.
      audioCat.audio.Constant.GAIN_EFFECT_MAX, // Maximum.
      2, // Decimal places to round values to for display.
      audioCat.audio.Constant.GAIN_EFFECT_DEFAULT, // Default value.
      opt_gain // Initial value.
    );
};
goog.inherits(audioCat.state.effect.GainEffect, audioCat.state.effect.Effect);

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the gain.
 */
audioCat.state.effect.GainEffect.prototype.getGainField = function() {
  return this.gainField_;
};

/** @override */
audioCat.state.effect.GainEffect.prototype.retrieveDisplayables = function() {
  return [this.gainField_];
};
