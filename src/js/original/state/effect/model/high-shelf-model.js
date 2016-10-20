goog.provide('audioCat.state.effect.model.HighShelfModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.HighShelfFilter');


/**
 * A model that describes a high shelf filter effect.
 * Instances of highshelf filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.HighShelfModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.HIGHSHELF,
      audioCat.state.effect.EffectCategory.FILTER,
      'highshelf',
      'hs',
      'Boosts high frequencies.');
};
goog.inherits(audioCat.state.effect.model.HighShelfModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.HighShelfModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.HighShelfFilter(
      effectModelController, idGenerator);
};
