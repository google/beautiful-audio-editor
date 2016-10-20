goog.provide('audioCat.state.effect.model.DynamicCompressorModel');

goog.require('audioCat.state.effect.DynamicCompressorEffect');
goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');


/**
 * A model that describes an effect that compresses magnitudes so that we make
 * maximal use of the volume range.s
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.DynamicCompressorModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR,
      audioCat.state.effect.EffectCategory.GAIN,
      'dynamic compressor',
      'dc',
      'Weakens loud parts, and loudens the soft parts, ' +
          'thus making greater use of volume range. Can prevent clipping.');
};
goog.inherits(audioCat.state.effect.model.DynamicCompressorModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.DynamicCompressorModel.prototype.
    createDefaultEffect = function(effectModelController, idGenerator) {
  return new audioCat.state.effect.DynamicCompressorEffect(
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR),
      idGenerator);
};
