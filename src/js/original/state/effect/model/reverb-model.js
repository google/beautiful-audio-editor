goog.provide('audioCat.state.effect.model.ReverbModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.ReverbEffect');


/**
 * A model that describes an effect for introducing simple reverb.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.ReverbModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.REVERB,
      audioCat.state.effect.EffectCategory.REVERB,
      'reverb',
      'r',
      'Introduces reverb.');
};
goog.inherits(audioCat.state.effect.model.ReverbModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.ReverbModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.ReverbEffect(
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.REVERB),
      idGenerator);
};
