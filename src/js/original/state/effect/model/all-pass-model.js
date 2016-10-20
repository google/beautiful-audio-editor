goog.provide('audioCat.state.effect.model.AllPassModel');

goog.require('audioCat.state.effect.AllPassFilter');
goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');


/**
 * A model that describes a peaking filter effect.
 * Instances of peaking filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.AllPassModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.NOTCH,
      audioCat.state.effect.EffectCategory.FILTER,
      'allpass',
      'ap',
      'Lets all frequencies pass. Alters the phase relationship between' +
          ' frequencies.');
};
goog.inherits(audioCat.state.effect.model.AllPassModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.AllPassModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.AllPassFilter(
      effectModelController, idGenerator);
};
