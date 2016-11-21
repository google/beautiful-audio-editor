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
goog.provide('audioCat.state.effect.FilterEffect');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.effect.Effect');
goog.require('audioCat.state.effect.field.GradientField');
goog.require('audioCat.utility.Unit');


/**
 * An effect that is filter-based, ie a highpass filter.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_q The initial q value. Optional.
 * @param {number=} opt_gain The initial gain value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.Effect}
 */
audioCat.state.effect.FilterEffect = function(
    model,
    idGenerator,
    opt_frequency,
    opt_q,
    opt_gain) {
  goog.base(this, model, idGenerator);

  /**
   * The filter effect junction for this effect. May change throughout the
   * lifetime of the app.
   * @private {audioCat.audio.junction.effect.FilterEffectJunction}
   */
  this.junction_ = null;

  /**
   * The field that controls frequency.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.frequencyField_ = new audioCat.state.effect.field.GradientField(
      'frequency', // The name of the field.
      'How sharply the filter should apply.', // Description.
      audioCat.utility.Unit.HZ,
      audioCat.audio.Constant.FILTER_EFFECT_FREQUENCY_MIN,
      audioCat.audio.Constant.FILTER_EFFECT_FREQUENCY_MAX,
      0, // Decimal places to round values to for display.
      audioCat.audio.Constant.DEFAULT_FILTER_FREQUENCY, // Default value.
      opt_frequency // Initial value.
    );

  /**
   * The field that controls Q.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.qField_ = new audioCat.state.effect.field.GradientField(
      'Q', // The name of the field.
      'How peaked the frequency is around the cutoff.', // Description.
      audioCat.utility.Unit.DB,
      audioCat.audio.Constant.FILTER_EFFECT_Q_MIN,
      audioCat.audio.Constant.FILTER_EFFECT_Q_MAX,
      2, // Decimal places to round values to for display.
      audioCat.audio.Constant.DEFAULT_FILTER_Q, // Default value.
      opt_q // Initial value.
    );

  /**
   * The field that controls gain.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.gainField_ = new audioCat.state.effect.field.GradientField(
      'gain', // The name of the field.
      'The boost in gain to apply.', // Description.
      audioCat.utility.Unit.DB,
      audioCat.audio.Constant.FILTER_EFFECT_GAIN_MIN,
      audioCat.audio.Constant.FILTER_EFFECT_GAIN_MAX,
      2, // Decimal places to round values to for display.
      audioCat.audio.Constant.DEFAULT_FILTER_GAIN, // Default value.
      opt_gain // Initial value.
    );
};
goog.inherits(audioCat.state.effect.FilterEffect, audioCat.state.effect.Effect);

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the frequency.
 */
audioCat.state.effect.FilterEffect.prototype.getFrequencyField = function() {
  return this.frequencyField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the Q or quality value.
 */
audioCat.state.effect.FilterEffect.prototype.getQField = function() {
  return this.qField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the gain.
 */
audioCat.state.effect.FilterEffect.prototype.getGainField = function() {
  return this.gainField_;
};

/** @override */
audioCat.state.effect.FilterEffect.prototype.retrieveDisplayables = function() {
  var displayables = [];
  if (this.frequencyField_.getActiveState()) {
    displayables.push(this.frequencyField_);
  }
  if (this.qField_.getActiveState()) {
    displayables.push(this.qField_);
  }
  if (this.gainField_.getActiveState()) {
    displayables.push(this.gainField_);
  }
  return displayables;
};

/**
 * Copies the magnitude and phase responses of this filter for a given array of
 * frequency values into the provided arrays. Does nothing if the junction is
 * not set yet.
 * @param {!Float32Array} frequencies An array of frequencies to get values for.
 * @param {!Float32Array} magResponse The corresponding magnitude responses.
 * @param {!Float32Array} phaseResponse The corresponding phase responses.
 * @return {boolean} True iff response data was successfully copied in this
 *     call.
 */
audioCat.state.effect.FilterEffect.prototype.
    getFrequencyResponse = function(frequencies, magResponse, phaseResponse) {
  if (this.junction_) {
    this.junction_.getFrequencyResponse(
        frequencies, magResponse, phaseResponse);
    return true;
  }
  return false;
};

/**
 * Sets the junction for this effect.
 * @param {audioCat.audio.junction.effect.FilterEffectJunction} junction The
 *     junction to set to.
 */
audioCat.state.effect.FilterEffect.prototype.setJunction = function(junction) {
  this.junction_ = junction;
};
