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
goog.provide('audioCat.state.effect.EffectListChangedEvent');

goog.require('audioCat.utility.Event');


/**
 * An event signifying that the effects in the list of an effect manager has
 * changed. For instance, the index of an effect might have changed. Or an
 * effect could have been either added or removed.
 * @param {string} eventType The specific type of event.
 * @param {!audioCat.state.effect.Effect} effect The effect that this event
 *     pertains to.
 * @param {number} index The latest index of the effect.
 * @param {number=} opt_previousIndex For swap events, this is the previous
 *     index at which the effect resided.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.effect.EffectListChangedEvent = function(
    eventType,
    effect,
    index,
    opt_previousIndex) {
  goog.base(this, eventType);

  /**
   * @private {!audioCat.state.effect.Effect}
   */
  this.effect_ = effect;

  /**
   * @private {number}
   */
  this.index_ = index;

  /**
   * @private {number|undefined}
   */
  this.previousIndex_ = opt_previousIndex;
};
goog.inherits(
    audioCat.state.effect.EffectListChangedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.effect.Effect} The effect pertaining to this event.
 */
audioCat.state.effect.EffectListChangedEvent.prototype.getEffect = function() {
  return this.effect_;
};

/**
 * @return {number} The index that pertains to this change.
 */
audioCat.state.effect.EffectListChangedEvent.prototype.getIndex = function() {
  return this.index_;
};

/**
 * @return {number|undefined} The previous index of the effect if applicable.
 */
audioCat.state.effect.EffectListChangedEvent.prototype.getPreviousIndex =
    function() {
  return this.previousIndex_;
};
