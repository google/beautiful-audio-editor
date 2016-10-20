goog.provide('audioCat.state.effect.model.NotchModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.NotchFilter');


/**
 * A model that describes a peaking filter effect.
 * Instances of peaking filters take on this general model.
 * @constructor
 * @extends {audioCat.state.effect.EffectModel}
 */
audioCat.state.effect.model.NotchModel = function() {
  goog.base(this, audioCat.state.effect.EffectId.NOTCH,
      audioCat.state.effect.EffectCategory.FILTER,
      'notch',
      'n',
      'Weakens frequencies within a range.');
};
goog.inherits(audioCat.state.effect.model.NotchModel,
    audioCat.state.effect.EffectModel);

/** @override */
audioCat.state.effect.model.NotchModel.prototype.createDefaultEffect =
    function(effectModelController, idGenerator) {
  return new audioCat.state.effect.NotchFilter(
      effectModelController, idGenerator);
};
