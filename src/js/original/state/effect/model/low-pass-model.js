goog.provide('audioCat.state.effect.model.LowPassModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.LowPassFilter');


/**
 * A model that describes a lowpass filter effect.
 * Instances of lowpass filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.LowPassModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.LOWPASS,
      audioCat.state.effect.EffectCategory.FILTER,
      'lowpass',
      'lp',
      'Weakens high frequencies.');
};
goog.inherits(audioCat.state.effect.model.LowPassModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.LowPassModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.LowPassFilter(
      effectModelController, idGenerator);
};
