goog.provide('audioCat.state.effect.LowShelfFilter');

goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');


/**
 * An effect that boost low frequencies and leaves higher ones unaffected.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_gain The initial gain value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.FilterEffect}
 */
audioCat.state.effect.LowShelfFilter = function(
    effectModelController,
    idGenerator,
    opt_frequency,
    opt_gain) {
  goog.base(this,
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.LOWSHELF),
      idGenerator,
      opt_frequency,
      undefined,
      opt_gain);

  this.getFrequencyField().setDescription(
      'Frequencies below this cutoff are boosted.');

  // This filter has no use for this field.
  this.getQField().setActiveState(false);
};
goog.inherits(
    audioCat.state.effect.LowShelfFilter, audioCat.state.effect.FilterEffect);
