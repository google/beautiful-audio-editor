goog.provide('audioCat.state.command.MoveEffectCommand');

goog.require('audioCat.state.command.Command');


/**
 * Moves an effect either within an effect manager or across different ones.
 * @param {!audioCat.state.effect.EffectManager} oldEffectManager The effect
 *     manager we're moving from.
 * @param {number} oldIndex The previous index.
 * @param {!audioCat.state.effect.EffectManager} newEffectManager The effect
 *     manager we're moving to. Could be the same as the origin.
 * @param {number} newIndex The new index.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.MoveEffectCommand = function(
    oldEffectManager,
    oldIndex,
    newEffectManager,
    newIndex,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.oldEffectManager_ = oldEffectManager;

  /**
   * @private {number}
   */
  this.oldIndex_ = oldIndex;

  /**
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.newEffectManager_ = newEffectManager;

  /**
   * @private {number}
   */
  this.newIndex_ = newIndex;
};
goog.inherits(audioCat.state.command.MoveEffectCommand,
    audioCat.state.command.Command);

/**
 * Moves an effect.
 * @param {!audioCat.state.effect.EffectManager} effectManagerA The effect
 *     manager we are currently moving from.
 * @param {number} indexA The index into effect manager A.
 * @param {!audioCat.state.effect.EffectManager} effectManagerB The effect
 *     manager we are currently moving to.
 * @param {number} indexB The index into effect manager B.
 * @private
 */
audioCat.state.command.MoveEffectCommand.prototype.moveEffect_ = function(
    effectManagerA,
    indexA,
    effectManagerB,
    indexB) {
  if (effectManagerA.getId() == effectManagerB.getId()) {
    // We're moving within the same effect manager.
    effectManagerA.moveEffect(indexA, indexB);
  } else {
    // We've moved an effect to a different effect manager.
    var effect = effectManagerA.getEffectAtIndex(indexA);
    effectManagerA.removeEffectAtIndex(indexA);
    effectManagerB.addEffect(effect, indexB);
  }
};

/** @override */
audioCat.state.command.MoveEffectCommand.prototype.perform = function() {
  this.moveEffect_(
      this.oldEffectManager_,
      this.oldIndex_,
      this.newEffectManager_,
      this.newIndex_);
};

/** @override */
audioCat.state.command.MoveEffectCommand.prototype.undo =
    function(project, trackManager) {
  this.moveEffect_(
      this.newEffectManager_,
      this.newIndex_,
      this.oldEffectManager_,
      this.oldIndex_);
};

/** @override */
audioCat.state.command.MoveEffectCommand.prototype.getSummary = function(
    forward) {
  var oldEffectManager = this.oldEffectManager_;
  var newEffectManager = this.newEffectManager_;
  if (oldEffectManager.getId() == newEffectManager.getId()) {
    return 'Moved effect from position ' + this.oldIndex_ + ' to ' +
        this.newIndex_;
  }
  var origin = forward ? oldEffectManager : newEffectManager;
  var dest = forward ? newEffectManager : oldEffectManager;
  return 'Moved effect from ' + origin.getAudioSegmentLabel() + ' to ' +
      dest.getAudioSegmentLabel() + '.';
};
