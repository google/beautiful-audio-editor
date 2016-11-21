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
goog.provide('audioCat.state.effect.DynamicCompressorEffect');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.effect.Effect');
goog.require('audioCat.state.effect.field.GradientField');

/**
 * An effect that compresses magnitudes so that we can make maximal use of the
 * volume range.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_attack The initial attack value. Optional.
 * @param {number=} opt_knee The initial knee value. Optional.
 * @param {number=} opt_ratio The initial ratio value. Optional.
 * @param {number=} opt_release The initial release value. Optional.
 * @param {number=} opt_threshold The initial threshold value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.Effect}
 */
audioCat.state.effect.DynamicCompressorEffect = function(
    model,
    idGenerator,
    opt_attack,
    opt_knee,
    opt_ratio,
    opt_release,
    opt_threshold) {
  goog.base(this, model, idGenerator);

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.attackField_ = new audioCat.state.effect.field.GradientField(
      'attack', // The name of the field.
      'The time taken to reduce gain by 10dB.', // Description.
      's',
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_ATTACK_MIN, // Minimum.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_ATTACK_MAX, // Maximum.
      3, // Decimal places to round values to for display.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_ATTACK_DEFAULT, // Default.
      opt_attack // Initial value.
    );

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.ratioField_ = new audioCat.state.effect.field.GradientField(
      'ratio', // The name of the field.
      'The dB change in input for each dB change in output.',
      'dB',
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RATIO_MIN, // Minimum.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RATIO_MAX, // Maximum.
      1, // Decimal places to round values to for display.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RATIO_DEFAULT, // Default.
      opt_ratio // Initial value.
    );

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.releaseField_ = new audioCat.state.effect.field.GradientField(
      'release', // The name of the field.
      'The amount of time to increase the gain by 10 dB.',
      's',
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RELEASE_MIN, // Minimum.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RELEASE_MAX, // Maximum.
      3, // Decimal places to round values to for display.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_RELEASE_DEFAULT, // Default.
      opt_release // Initial value.
    );

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.thresholdField_ = new audioCat.state.effect.field.GradientField(
      'threshold', // The name of the field.
      'The dB value above which compression occurs.',
      'dB',
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_THRESHOLD_MIN, // Minimum.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_THRESHOLD_MAX, // Maximum.
      1, // Decimal places to round values to for display.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_THRESHOLD_DEFAULT, // Default.
      opt_threshold // Initial value.
    );

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.kneeField_ = new audioCat.state.effect.field.GradientField(
      'knee', // The name of the field.
      'The dB value above the threshold at which we smoothly transition to ' +
          'applying the ratio.', // Description.
      'dB',
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_KNEE_MIN, // Minimum.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_KNEE_MAX, // Maximum.
      1, // Decimal places to round values to for display.
      audioCat.audio.Constant.DYNAMIC_COMPRESSOR_KNEE_DEFAULT, // Default.
      opt_knee // Initial value.
    );
};
goog.inherits(audioCat.state.effect.DynamicCompressorEffect,
    audioCat.state.effect.Effect);

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the attack.
 */
audioCat.state.effect.DynamicCompressorEffect.prototype.getAttackField =
    function() {
  return this.attackField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the ratio.
 */
audioCat.state.effect.DynamicCompressorEffect.prototype.getRatioField =
    function() {
  return this.ratioField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the release.
 */
audioCat.state.effect.DynamicCompressorEffect.prototype.getReleaseField =
    function() {
  return this.releaseField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the threshold.
 */
audioCat.state.effect.DynamicCompressorEffect.prototype.getThresholdField =
    function() {
  return this.thresholdField_;
};

/**
 * @return {!audioCat.state.effect.field.GradientField} The field controlling
 *     the knee.
 */
audioCat.state.effect.DynamicCompressorEffect.prototype.getKneeField =
    function() {
  return this.kneeField_;
};

/** @override */
audioCat.state.effect.DynamicCompressorEffect.prototype.retrieveDisplayables =
    function() {
  return [
      this.attackField_,
      this.ratioField_,
      this.releaseField_,
      this.thresholdField_,
      this.kneeField_];
};
