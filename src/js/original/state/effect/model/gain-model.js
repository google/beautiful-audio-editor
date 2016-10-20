goog.provide('audioCat.state.effect.model.GainModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.GainEffect');


/**
 * A model that describes an effect for significantly altering gain.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.GainModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.GAIN,
      audioCat.state.effect.EffectCategory.GAIN,
      'gain',
      'g',
      'Significantly alters gain.');
};
goog.inherits(audioCat.state.effect.model.GainModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.GainModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.GainEffect(
      effectModelController.getModelFromId(audioCat.state.effect.EffectId.GAIN),
      idGenerator);
};
