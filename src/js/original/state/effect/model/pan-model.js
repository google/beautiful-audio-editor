goog.provide('audioCat.state.effect.model.PanModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.PanEffect');


/**
 * A model that describes an effect for panning.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.PanModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.PAN,
      audioCat.state.effect.EffectCategory.GAIN,
      'pan',
      'p',
      'Pans left or right.');
};
goog.inherits(audioCat.state.effect.model.PanModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.PanModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.PanEffect(
      effectModelController.getModelFromId(audioCat.state.effect.EffectId.PAN),
      idGenerator);
};
