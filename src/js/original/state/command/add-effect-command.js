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
