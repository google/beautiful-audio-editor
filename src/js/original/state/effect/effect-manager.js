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
goog.provide('audioCat.state.effect.EffectManager');

goog.require('audioCat.state.effect.EffectListChangedEvent');
goog.require('audioCat.state.effect.EventType');
goog.require('goog.array');


/**
 * Manages a segment of effects. Could be used to manage the effects for a track
 * for instance. Or for the effects that pertain to the overall project.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {function():string} labeler A function that returns a string
 *     describing the audio segment for this effect manager.
 * @param {!Array.<!audioCat.state.effect.Effect>=} opt_effects A list of
 *     effects for initially populating the manager. Optional.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.effect.EffectManager = function(
    idGenerator,
    labeler,
    opt_effects) {
  goog.base(this);

  /**
   * @private {audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * @private {function():string}
   */
  this.labeler_ = labeler;

  /**
   * Effects to be applied. In this order.
   * @private {!Array.<!audioCat.state.effect.Effect>}
   */
  this.effects_ = opt_effects || [];
};
goog.inherits(
    audioCat.state.effect.EffectManager, audioCat.utility.EventTarget);

/**
 * Adds a new effect to the manager at a given index. Dispatches an event noting
 * that a new effect has been added. The event provides the index.
 * @param {!audioCat.state.effect.Effect} effect The effect to add.
 * @param {number=} opt_index Optional index at which to add the effect. If not
 *     provided, defaults to the length of the list.
 */
audioCat.state.effect.EffectManager.prototype.addEffect =
    function(effect, opt_index) {
  var indexAdded = goog.isDef(opt_index) ? opt_index : this.effects_.length;
  goog.array.insertAt(this.effects_, effect, opt_index);
  this.dispatchEvent(new audioCat.state.effect.EffectListChangedEvent(
      audioCat.state.effect.EventType.EFFECT_ADDED, effect, indexAdded));
};

/**
 * Removes the effect at the given index. Dispatches an event that provides the
 * effect and the previous index of the event. Assumes that the index is valid.
 * @param {number} index The index of the effect to remove.
 */
audioCat.state.effect.EffectManager.prototype.removeEffectAtIndex =
    function(index) {
  var effect = this.effects_[index];
  goog.array.removeAt(this.effects_, index);
  this.dispatchEvent(new audioCat.state.effect.EffectListChangedEvent(
      audioCat.state.effect.EventType.EFFECT_REMOVED, effect, index, index));
};

/**
 * Removes all effects from this effect manager.
 */
audioCat.state.effect.EffectManager.prototype.removeAllEffects = function() {
  var numberOfEffects = this.getNumberOfEffects();
  for (var i = numberOfEffects - 1; i >= 0; --i) {
    this.removeEffectAtIndex(i);
  }
};

/**
 * Obtains the index of the effect with the given ID. Note that this function
 *     runs in O(n) time. Throws an exception if this manager lacks the effect.
 * @param {!audioCat.utility.Id} effectId The ID of the effect to find.
 * @return {number} The index of the effect with the given ID.
 */
audioCat.state.effect.EffectManager.prototype.obtainEffectIndexById =
    function(effectId) {
  var effects = this.effects_;
  var numberOfEffects = effects.length;
  for (var i = 0; i < numberOfEffects; ++i) {
    if (effectId == effects[i].getId()) {
      return i;
    }
  }
  // The effect was not found.
  throw 2;
};

/**
 * Moves the effect at one index to another index. Assumes that oldIndex exists.
 * @param {number} oldIndex The index at which the effect resides now.
 * @param {number} newIndex The index to move the effect to.
 */
audioCat.state.effect.EffectManager.prototype.moveEffect =
    function(oldIndex, newIndex) {
  var effect = this.effects_[oldIndex];
  goog.array.moveItem(this.effects_, oldIndex, newIndex);
  this.dispatchEvent(new audioCat.state.effect.EffectListChangedEvent(
      audioCat.state.effect.EventType.EFFECT_MOVED,
      effect, newIndex, oldIndex));
};

/**
 * Retrieves the effect at a given index.
 * @param {number} index The index.
 * @return {!audioCat.state.effect.Effect} The effect at the given index.
 */
audioCat.state.effect.EffectManager.prototype.getEffectAtIndex =
    function(index) {
  return this.effects_[index];
};

/**
 * @return {number} The number of effects in this manager.
 */
audioCat.state.effect.EffectManager.prototype.getNumberOfEffects = function() {
  return this.effects_.length;
};

/**
 * @return {string} A label for the audio segment for this effect manager.
 */
audioCat.state.effect.EffectManager.prototype.getAudioSegmentLabel =
    function() {
  return this.labeler_();
};

/**
 * @return {audioCat.utility.Id} The ID of this effect manager.
 */
audioCat.state.effect.EffectManager.prototype.getId =
    function() {
  return this.id_;
};
