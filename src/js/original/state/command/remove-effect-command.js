/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
