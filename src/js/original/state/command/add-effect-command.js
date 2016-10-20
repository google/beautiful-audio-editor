goog.provide('audioCat.state.command.AddEffectCommand');

goog.require('audioCat.state.command.Command');


/**
 * Adds an audio effect.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {!audioCat.state.effect.Effect} effect The effect to add.
 * @param {number} index The index at which to add the effect.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AddEffectCommand =
    function(effectManager, effect, index, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The effect manager to add the effect to.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  /**
   * The effect to add.
   * @private {!audioCat.state.effect.Effect}
   */
  this.effect_ = effect;

  /**
   * The index at which to add the effect.
   * @private {number}
   */
  this.index_ = index;
};
goog.inherits(audioCat.state.command.AddEffectCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AddEffectCommand.prototype.perform =
    function(project, trackManager) {
  this.effectManager_.addEffect(this.effect_, this.index_);
};

/** @override */
audioCat.state.command.AddEffectCommand.prototype.undo =
    function(project, trackManager) {
  // The removal is a lot faster if we know the index.
  this.effectManager_.removeEffectAtIndex(this.index_);
};

/** @override */
audioCat.state.command.AddEffectCommand.prototype.getSummary = function(
    forward) {
  var effectName = this.effect_.getModel().getName();
  var segmentLabel = this.effectManager_.getAudioSegmentLabel();
  return (forward ? 'Add' : 'Remov') + 'ed ' + effectName + ' effect ' +
      (forward ? 'to' : 'from') + ' ' + segmentLabel + '.';
};
