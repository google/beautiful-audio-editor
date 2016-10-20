goog.provide('audioCat.state.effect.model.PeakingModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.PeakingFilter');


/**
 * A model that describes a peaking filter effect.
 * Instances of peaking filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.PeakingModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.PEAKING,
      audioCat.state.effect.EffectCategory.FILTER,
      'peaking',
      'hs',
      'Boosts frequencies within a range.');
};
goog.inherits(audioCat.state.effect.model.PeakingModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.PeakingModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.PeakingFilter(
      effectModelController, idGenerator);
};
