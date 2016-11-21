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
goog.provide('audioCat.audio.junction.effect.DynamicCompressorEffectJunction');

goog.require('audioCat.audio.junction.DynamicCompressorJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.EffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.field.EventType');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * An audio junction that compresses volume.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API in general.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.effect.DynamicCompressorEffect} effect The effect.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @constructor
 * @extends {audioCat.audio.junction.DynamicCompressorJunction}
 * @implements {audioCat.audio.junction.effect.EffectJunction}
 */
audioCat.audio.junction.effect.DynamicCompressorEffectJunction = function(
    audioContextManager,
    idGenerator,
    effect,
    audioUnitConverter) {
  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  var attackField = effect.getAttackField();
  var kneeField = effect.getKneeField();
  var ratioField = effect.getRatioField();
  var releaseField = effect.getReleaseField();
  var thresholdField = effect.getThresholdField();

  goog.base(
      this,
      idGenerator,
      audioContextManager,
      attackField.getValue(),
      kneeField.getValue(),
      ratioField.getValue(),
      releaseField.getValue(),
      thresholdField.getValue());

  /**
   * Listeners for changes in various fields of the effect. We maintain the keys
   * for these listeners so that we can remove them when we clean up later.
   * @private {!Array.<!goog.events.Key>}
   */
  this.listeners_ = [
      goog.events.listen(attackField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          goog.bind(
              this.handleValueChange_,
              this,
              this.audioContextManager.setAttack), false, this),
      goog.events.listen(kneeField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          goog.bind(
              this.handleValueChange_,
              this,
              this.audioContextManager.setKnee), false, this),
      goog.events.listen(ratioField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          goog.bind(
              this.handleValueChange_,
              this,
              this.audioContextManager.setRatio), false, this),
      goog.events.listen(releaseField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          goog.bind(
              this.handleValueChange_,
              this,
              this.audioContextManager.setRelease), false, this),
      goog.events.listen(thresholdField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          goog.bind(
              this.handleValueChange_,
              this,
              this.audioContextManager.setThreshold), false, this)
    ];
};
goog.inherits(audioCat.audio.junction.effect.DynamicCompressorEffectJunction,
    audioCat.audio.junction.DynamicCompressorJunction);

/**
 * Handles changes in some gradient field.
 * @param {function(!DynamicsCompressorNode, number)} setter The method that
 *     sets the respective value. To be called with the audio context manager as
 *     the execution context.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.DynamicCompressorEffectJunction.prototype.
    handleValueChange_ = function(setter, event) {
  setter.call(this.audioContextManager, this.dynamicCompressorNode,
      /** @type {!audioCat.state.effect.field.GradientField} */ (event.target).
          getValue());
};

/** @override */
audioCat.audio.junction.effect.DynamicCompressorEffectJunction.prototype.
    cleanUp = function() {
  for (var i = 0; i < this.listeners_.length; ++i) {
    goog.events.unlistenByKey(this.listeners_[i]);
  }
  goog.base(this, 'cleanUp');
};
