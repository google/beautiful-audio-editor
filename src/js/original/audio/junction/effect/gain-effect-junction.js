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
goog.provide('audioCat.audio.junction.effect.GainEffectJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.EffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.field.EventType');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * An audio junction that alters gain in response to a gain effect.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API in general.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.effect.GainEffect} effect The associated gain effect.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @param {number} numberOfOutputChannels The number of output channels.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.effect.EffectJunction}
 */
audioCat.audio.junction.effect.GainEffectJunction = function(
    audioContextManager,
    idGenerator,
    effect,
    audioUnitConverter,
    numberOfOutputChannels) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.GAIN_EFFECT);
  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  var gainNode = audioContextManager.createGainNode();
  audioContextManager.setChannelCount(gainNode, numberOfOutputChannels);
  /**
   * A biquad filter node that actuates a filter effect in the audio.
   * @private {!GainNode}
   */
  this.gainNode_ = gainNode;

  var gainField = effect.getGainField();
  audioContextManager.setGain(
      gainNode,
      audioUnitConverter.convertDecibelToSample(gainField.getValue()));

  /**
   * Listeners for changes in various fields of the effect. We maintain the keys
   * for these listeners so that we can remove them when we clean up later.
   * @private {!Array.<!goog.events.Key>}
   */
  this.listeners_ = [
      goog.events.listen(gainField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handleGainChange_, false, this)
    ];
};
goog.inherits(audioCat.audio.junction.effect.GainEffectJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.effect.GainEffectJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var audioContextManager = this.audioContextManager;
    var offlineGainNode = audioContextManager.createGainNode(
        opt_offlineAudioContext);
    // Mimic the live node.
    audioContextManager.setChannelCount(
        offlineGainNode,
        audioContextManager.getChannelCount(this.gainNode_));
    audioContextManager.setGain(
        offlineGainNode,
        audioContextManager.getGain(this.gainNode_));
    offlineGainNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineGainNode;
  }
  return this.gainNode_;
};

/** @override */
audioCat.audio.junction.effect.GainEffectJunction.prototype.connect =
    function(junction) {
  this.gainNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.effect.GainEffectJunction.prototype.disconnect =
    function() {
  this.gainNode_.disconnect();
  // Removes javascript stores of previous/next node links.
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.effect.GainEffectJunction.prototype.cleanUp =
    function() {
  this.disconnect();
  var listeners = this.listeners_;
  var unlistenFunction = goog.events.unlistenByKey;
  for (var i = 0; i < listeners.length; ++i) {
    unlistenFunction(listeners[i]);
  }
};

/**
 * Handles changes in gain.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.GainEffectJunction.prototype.handleGainChange_ =
    function(event) {
  var dbValue = /** @type {!audioCat.state.effect.field.GradientField} */ (
      event.target).getValue();
  this.audioContextManager.setGain(
      this.gainNode_,
      this.audioUnitConverter_.convertDecibelToSample(dbValue));
};
