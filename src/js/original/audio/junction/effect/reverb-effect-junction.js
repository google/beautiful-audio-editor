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
goog.provide('audioCat.audio.junction.effect.ReverbEffectJunction');

goog.require('audioCat.audio.junction.ConvolverJunction');
goog.require('audioCat.audio.junction.EventType');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.EffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.field.EventType');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * An audio junction that implements an effect that adds reverb.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API in general.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.effect.ReverbEffect} effect The effect.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @param {number} numberOfChannels The number of output channels.
 * @constructor
 * @extends {audioCat.audio.junction.ConvolverJunction}
 * @implements {audioCat.audio.junction.effect.EffectJunction}
 */
audioCat.audio.junction.effect.ReverbEffectJunction = function(
    audioContextManager,
    idGenerator,
    effect,
    audioUnitConverter,
    numberOfChannels) {
  goog.base(
      this,
      idGenerator,
      audioContextManager);
  /**
   * The associated effect.
   * @private {!audioCat.state.effect.ReverbEffect}
   */
  this.effect_ = effect;

  /**
   * @private {number}
   */
  this.numberOfChannels_ = numberOfChannels;

  var self = this;
  /**
   * Listeners for changes in various fields of the effect. We maintain the keys
   * for these listeners so that we can remove them when we clean up later.
   * @private {!Array.<!goog.events.Key>}
   */
  this.listeners_ = [
    goog.events.listen(
        this,
        audioCat.audio.junction.EventType.NEW_IMPULSE_RESPONSE_NEEDED,
        /** @param {!audioCat.audio.junction.NewImpulseResponseNeededEvent} e */
        function(e) {
          self.createAndSetImpulseResponse_(
              effect, audioContextManager.getSampleRate());
        })
  ];

  var fields = effect.retrieveDisplayables();
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i] instanceof audioCat.state.effect.field.Field) {
      this.listeners_.push(goog.events.listen(fields[i],
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handleReverbChange_, false, this));
    }
  }
  this.createAndSetImpulseResponse_(
      effect, audioContextManager.getSampleRate());
};
goog.inherits(audioCat.audio.junction.effect.ReverbEffectJunction,
    audioCat.audio.junction.ConvolverJunction);

/**
 * Handles changes in the nature of the reverb.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.ReverbEffectJunction.prototype.
    handleReverbChange_ =
    function(event) {
  this.createAndSetImpulseResponse_(
      this.effect_, this.audioContextManager.getSampleRate());
};

/**
 * Creates and sets the impulse response.
 * @param {!audioCat.state.effect.ReverbEffect} reverbEffect The associated
 *     reverb effect.
 * @param {number} sampleRate The sample rate of the convolved buffer to be.
 * @private
 */
audioCat.audio.junction.effect.ReverbEffectJunction.prototype.
    createAndSetImpulseResponse_ = function(reverbEffect, sampleRate) {
  var length = sampleRate * this.effect_.getDurationField().getValue() / 1000;
  var numberOfChannels = this.numberOfChannels_;

  var impulseResponse = this.audioContextManager.createEmptyAudioBuffer(
      numberOfChannels, length, sampleRate);
  var impulseL = impulseResponse.getChannelData(0);
  var impulseR = impulseResponse.getChannelData(1);

  var reversed = this.effect_.getReversedField().getValue();
  var decay = this.effect_.getDecayField().getValue() / 1000;
  var singleSampleProportion = 1 / length;
  if (reversed) {
    var powerBase = 0;
    for (var i = length - 1; i >= 0; --i) {
      var exponentiatedDecay = Math.pow(powerBase, decay);
      var randomValue = Math.random();
      impulseL[i] = (randomValue + randomValue - 1) * exponentiatedDecay;
      randomValue = Math.random();
      impulseR[i] = (randomValue + randomValue - 1) * exponentiatedDecay;
      powerBase += singleSampleProportion;
    }
  } else {
    var powerBase = 1;
    for (var i = 0; i < length; ++i) {
      var exponentiatedDecay = Math.pow(powerBase, decay);
      var randomValue = Math.random();
      impulseL[i] = (randomValue + randomValue - 1) * exponentiatedDecay;
      randomValue = Math.random();
      impulseR[i] = (randomValue + randomValue - 1) * exponentiatedDecay;
      powerBase -= singleSampleProportion;
    }
  }
  this.setImpulseResponse(impulseResponse);
};

/** @override */
audioCat.audio.junction.effect.ReverbEffectJunction.prototype.cleanUp =
    function() {
  for (var i = 0; i < this.listeners_.length; ++i) {
    goog.events.unlistenByKey(this.listeners_[i]);
  }
  goog.base(this, 'cleanUp');
};
