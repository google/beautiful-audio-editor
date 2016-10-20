goog.provide('audioCat.state.command.RemoveEffectCommand');

goog.require('audioCat.state.command.Command');


/**
 * Adds an audio effect to an effect manager, which manages effects for a
 * certain segment of audio.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {number} index The index of the effect to remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveEffectCommand = function(
    effectManager,
    index,
    idGenerator) {
  goog.base(this, idGenerator, true);

  var effect = effectManager.getEffectAtIndex(index);
  /**
   * The effect to remove.
   * @private {!audioCat.state.effect.Effect}
   */
  this.effect_ = effect;

  /**
   * The effect manager to remove the effect from.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  /**
   * The index of the effect to remove.
   * @private {number}
   */
  this.index_ = index;
};
goog.inherits(audioCat.state.command.RemoveEffectCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveEffectCommand.prototype.perform =
    function(project, trackManager) {
  this.effectManager_.removeEffectAtIndex(this.index_);
};

/** @override */
audioCat.state.command.RemoveEffectCommand.prototype.undo =
    function(project, trackManager) {
  this.effectManager_.addEffect(this.effect_, this.index_);
};

/** @override */
audioCat.state.command.RemoveEffectCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Remov' : 'Add') + 'ed ' +
      this.effect_.getModel().getName() + ' effect ' +
      (forward ? 'from' : 'to') + ' ' +
      this.effectManager_.getAudioSegmentLabel() + '.';
};
