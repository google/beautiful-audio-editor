goog.provide('audioCat.state.effect.model.BandPassModel');

goog.require('audioCat.state.effect.BandPassFilter');
goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');


/**
 * A model that describes a bandpass filter effect.
 * Instances of highpass filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.BandPassModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.BANDPASS,
      audioCat.state.effect.EffectCategory.FILTER,
      'bandpass',
      'bp',
      'Weakens frequencies outside of a range.');
};
goog.inherits(audioCat.state.effect.model.BandPassModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.BandPassModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.BandPassFilter(
      effectModelController, idGenerator);
};
