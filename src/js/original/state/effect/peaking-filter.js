goog.provide('audioCat.state.effect.PeakingFilter');

goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.FilterEffect');


/**
 * Boost frequencies within a certain range.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number=} opt_frequency The initial frequency value. Optional.
 * @param {number=} opt_q The initial q value. Optional.
 * @param {number=} opt_gain The initial gain value. Optional.
 * @constructor
 * @extends {audioCat.state.effect.FilterEffect}
 */
audioCat.state.effect.PeakingFilter = function(
    effectModelController,
    idGenerator,
    opt_frequency,
    opt_q,
    opt_gain) {
  goog.base(this,
      effectModelController.getModelFromId(
          audioCat.state.effect.EffectId.PEAKING),
      idGenerator,
      opt_frequency,
      opt_q,
      opt_gain);

  this.getFrequencyField().setDescription(
      'Centers the range over this frequency.');

  this.getQField().setDescription(
      'Smaller Q values yield larger frequency ranges.');
};
goog.inherits(
    audioCat.state.effect.PeakingFilter, audioCat.state.effect.FilterEffect);
