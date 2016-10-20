goog.provide('audioCat.state.effect.model.LowShelfModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.LowShelfFilter');


/**
 * A model that describes a low shelf filter effect.
 * Instances of lowshelf filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.LowShelfModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.LOWSHELF,
      audioCat.state.effect.EffectCategory.FILTER,
      'lowshelf',
      'ls',
      'Boosts low frequencies.');
};
goog.inherits(audioCat.state.effect.model.LowShelfModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.LowShelfModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.LowShelfFilter(
      effectModelController, idGenerator);
};
