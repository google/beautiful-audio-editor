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
goog.provide('audioCat.state.effect.ReverbEffect');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.effect.Effect');
goog.require('audioCat.state.effect.field.BooleanField');
goog.require('audioCat.state.effect.field.GradientField');
goog.require('audioCat.utility.Unit');


/**
 * An effect that introduces reverb.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_duration How long each reverberation lasts. Optional.
 * @param {number=} opt_decay How long the collective reverb lasts. Optional.
 * @param {boolean=} opt_reversed Whether the reverb is initially reversed.
 *     Optional. Defaults to false.
 * @constructor
 * @extends {audioCat.state.effect.Effect}
 */
audioCat.state.effect.ReverbEffect = function(
    model,
    idGenerator,
    opt_duration,
    opt_decay,
    opt_reversed) {
  goog.base(this, model, idGenerator);

  /**
   * The field that controls the duration of the reverb.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.durationField_ = new audioCat.state.effect.field.GradientField(
      'duration', // The name of the field.
      'How long each reverberation lasts.', // Description.
      audioCat.utility.Unit.MS,
      audioCat.audio.Constant.REVERB_DURATION_MIN,
      audioCat.audio.Constant.REVERB_DURATION_MAX,
      0, // Decimal places to round values to for display.
      audioCat.audio.Constant.REVERB_DURATION_DEFAULT, // Default value.
      opt_duration // Initial value.
    );

  /**
   * The field that controls how quickly the reverb decays.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.decayField_ = new audioCat.state.effect.field.GradientField(
      'decay', // The name of the field.
      'How steeply the reverb decays.', // Description.
      audioCat.utility.Unit.MS,
      audioCat.audio.Constant.REVERB_DECAY_MIN,
      audioCat.audio.Constant.REVERB_DECAY_MAX,
      0, // Decimal places to round values to for display.
      audioCat.audio.Constant.REVERB_DECAY_DEFAULT, // Default value.
      opt_decay // Initial value.
    );

  /**
   * The field that controls whether the effect is reversed.
   * @private {!audioCat.state.effect.field.BooleanField}
   */
  this.reversedField_ = new audioCat.state.effect.field.BooleanField(
      'reversed',
      'reverse the reverb',
      opt_reversed);
};
goog.inherits(audioCat.state.effect.ReverbEffect, audioCat.state.effect.Effect);

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the duration of each reverberation.
 */
audioCat.state.effect.ReverbEffect.prototype.getDurationField = function() {
  return this.durationField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     how quickly a collective reverb decays.
 */
audioCat.state.effect.ReverbEffect.prototype.getDecayField = function() {
  return this.decayField_;
};

/**
 * @return {!audioCat.state.effect.field.BooleanField} The field controlling
 *     whether the reverb is reversed.
 */
audioCat.state.effect.ReverbEffect.prototype.getReversedField = function() {
  return this.reversedField_;
};

/** @override */
audioCat.state.effect.ReverbEffect.prototype.retrieveDisplayables = function() {
  return [this.durationField_, this.decayField_, this.reversedField_];
};
