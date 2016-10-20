goog.provide('audioCat.state.effect.model.HighPassModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.HighPassFilter');


/**
 * A model that describes a highpass filter effect.
 * Instances of highpass filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.HighPassModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.HIGHPASS,
      audioCat.state.effect.EffectCategory.FILTER,
      'highpass',
      'hp',
      'Weakens low frequencies.');
};
goog.inherits(audioCat.state.effect.model.HighPassModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.HighPassModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.HighPassFilter(
      effectModelController, idGenerator);
};
