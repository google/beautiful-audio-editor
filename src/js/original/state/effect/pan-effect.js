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
