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
goog.provide('audioCat.audio.junction.effect.FilterEffectJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.EffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.field.EventType');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * An audio junction that applies a filter effect to audio. For instance, this
 * could be a low or high pass filter. It could also for instance be a bandpass
 * filter that only lets a certain band of frequencies through.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API in general.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.effect.FilterEffect} effect The effect that this
 *     junction is for. Must be a filter effect.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.effect.EffectJunction}
 */
audioCat.audio.junction.effect.FilterEffectJunction = function(
    audioContextManager,
    idGenerator,
    effect) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.FILTER_EFFECT);

  /**
   * The filter effect that this junction pertains to.
   * @private {!audioCat.state.effect.FilterEffect}
   */
  this.filterEffect_ = effect;
  effect.setJunction(this);

  var biquadFilterNode = audioContextManager.createBiquadFilter();
  /**
   * A biquad filter node that actuates a filter effect in the audio.
   * @private {!BiquadFilterNode}
   */
  this.filterNode_ = biquadFilterNode;

  // Determine which type of filter node to instantiate.
  var effectIdEnum = audioCat.state.effect.EffectId;
  var filterNodeTypeString;
  switch (effect.getModel().getEffectModelId()) {
    case effectIdEnum.ALLPASS:
      filterNodeTypeString = 'allpass';
      break;
    case effectIdEnum.BANDPASS:
      filterNodeTypeString = 'bandpass';
      break;
    case effectIdEnum.HIGHPASS:
      filterNodeTypeString = 'highpass';
      break;
    case effectIdEnum.HIGHSHELF:
      filterNodeTypeString = 'highshelf';
      break;
    case effectIdEnum.LOWPASS:
      filterNodeTypeString = 'lowpass';
      break;
    case effectIdEnum.LOWSHELF:
      filterNodeTypeString = 'lowshelf';
      break;
    case effectIdEnum.NOTCH:
      filterNodeTypeString = 'notch';
      break;
    case effectIdEnum.PEAKING:
      filterNodeTypeString = 'peaking';
      break;
  }
  goog.asserts.assert(
      filterNodeTypeString,
      'Could not find web audio node type associated with effect type id.');

  audioContextManager.setFilterType(
      biquadFilterNode, filterNodeTypeString);

  // TODO(chizeng): Make these values depend on the fields again.
  var frequencyField = effect.getFrequencyField();
  audioContextManager.setFilterFrequency(
      biquadFilterNode, frequencyField.getValue());

  var gainField = effect.getGainField();
  audioContextManager.setFilterGain(
      biquadFilterNode, gainField.getValue());

  var qField = effect.getQField();
  audioContextManager.setFilterQ(
      biquadFilterNode, qField.getValue());

  biquadFilterNode.detune.value = 1200;

  /**
   * Listeners for changes in various fields of the effect. We maintain the keys
   * for these listeners so that we can remove them when we clean up later.
   * @private {!Array.<!goog.events.Key>}
   */
  this.listeners_ = [
      goog.events.listen(frequencyField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handleFrequencyChange_, false, this),
      goog.events.listen(gainField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handleGainChange_, false, this),
      goog.events.listen(qField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handleQChange_, false, this)
    ];
};
goog.inherits(audioCat.audio.junction.effect.FilterEffectJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var audioContextManager = this.audioContextManager;
    var offlineFilterNode = audioContextManager.createBiquadFilter(
        opt_offlineAudioContext);

    // Have the offline node mimic the live one.
    var liveFilterNode = this.filterNode_;
    audioContextManager.setFilterType(offlineFilterNode,
        audioContextManager.getFilterType(liveFilterNode));
    audioContextManager.setFilterFrequency(offlineFilterNode,
        audioContextManager.getFilterFrequency(liveFilterNode));
    audioContextManager.setFilterGain(offlineFilterNode,
        audioContextManager.getFilterGain(liveFilterNode));
    audioContextManager.setFilterQ(offlineFilterNode,
        audioContextManager.getFilterQ(liveFilterNode));
    audioContextManager.setFilterDetune(offlineFilterNode,
        audioContextManager.getFilterDetune(liveFilterNode));

    offlineFilterNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineFilterNode;
  }
  return this.filterNode_;
};

/** @override */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.connect =
    function(junction) {
  this.filterNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.disconnect =
    function() {
  this.filterNode_.disconnect();
  // Removes javascript stores of previous/next node links.
  this.removeNextConnection();
};

/**
 * Copies the magnitude and phase responses of this filter for a given array of
 * frequency values into the provided arrays.
 * @param {!Float32Array} frequencies An array of frequencies to get values for.
 * @param {!Float32Array} magResponse The corresponding magnitude responses.
 * @param {!Float32Array} phaseResponse The corresponding phase responses.
 */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.
    getFrequencyResponse = function(frequencies, magResponse, phaseResponse) {
  this.audioContextManager.getFrequencyResponse(
      this.filterNode_, frequencies, magResponse, phaseResponse);
};

/** @override */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.cleanUp =
    function() {
  this.filterEffect_.setJunction(null);
  this.disconnect();
  var listeners = this.listeners_;
  var unlistenFunction = goog.events.unlistenByKey;
  for (var i = 0; i < listeners.length; ++i) {
    unlistenFunction(listeners[i]);
  }
};

/**
 * Handles changes in frequency.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.
    handleFrequencyChange_ = function(event) {
  this.audioContextManager.setFilterFrequency(
      this.filterNode_,
      /** @type {!audioCat.state.effect.field.GradientField} */ (event.target).
          getValue());
};

/**
 * Handles changes in gain.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.
    handleGainChange_ = function(event) {
  this.audioContextManager.setFilterGain(
      this.filterNode_,
      /** @type {!audioCat.state.effect.field.GradientField} */ (event.target).
          getValue());
};

/**
 * Handles changes in Q value.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.FilterEffectJunction.prototype.
    handleQChange_ = function(event) {
  this.audioContextManager.setFilterQ(
      this.filterNode_,
      /** @type {!audioCat.state.effect.field.GradientField} */ (event.target).
          getValue());
};
