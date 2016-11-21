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
goog.provide('audioCat.state.effect.PanEffect');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.effect.Effect');
goog.require('audioCat.state.effect.field.GradientField');

/**
 * An effect that pans from left to right.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_pan The initial pan value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.Effect}
 */
audioCat.state.effect.PanEffect = function(
    model,
    idGenerator,
    opt_pan) {
  goog.base(this, model, idGenerator);

  /**
   * The field that controls gain.
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.panField_ = new audioCat.state.effect.field.GradientField(
      'pan', // The name of the field.
      'How much to pan. Positive is right. Negative is left.', // Description.
      '',
      audioCat.audio.Constant.MIN_PAN_DEGREES, // Minimum.
      audioCat.audio.Constant.MAX_PAN_DEGREES, // Maximum.
      1, // Decimal places to round values to for display.
      audioCat.audio.Constant.DEFAULT_PAN_DEGREES, // Default value.
      opt_pan // Initial value.
    );
};
goog.inherits(audioCat.state.effect.PanEffect, audioCat.state.effect.Effect);

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     pan.
 */
audioCat.state.effect.PanEffect.prototype.getPanField = function() {
  return this.panField_;
};

/** @override */
audioCat.state.effect.PanEffect.prototype.retrieveDisplayables = function() {
  return [this.panField_];
};
