goog.provide('audioCat.state.effect.AllPassFilter');

goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');


/**
 * An effect that lets all frequencies through, but changes the phase
 * relationship between all frequencies.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_q The initial q value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.FilterEffect}
 */
audioCat.state.effect.AllPassFilter = function(
    effectModelController,
    idGenerator,
    opt_frequency,
    opt_q) {
  goog.base(this,
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.ALLPASS),
      idGenerator,
      opt_frequency,
      opt_q);

  this.getFrequencyField().setDescription(
      'The frequency with the max group delay ' +
      'and thus the center of the phase transition.');

  this.getQField().setDescription(
      'The larger the Q, the larger and sharper the transition will be.');

  // This filter has no use for this field.
  this.getGainField().setActiveState(false);
};
goog.inherits(
    audioCat.state.effect.AllPassFilter, audioCat.state.effect.FilterEffect);
