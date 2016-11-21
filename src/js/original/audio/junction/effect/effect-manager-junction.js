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
goog.provide('audioCat.audio.junction.effect.EffectManagerJunction');

goog.require('audioCat.audio.junction.EventType');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.DynamicCompressorEffectJunction');
goog.require('audioCat.audio.junction.effect.FilterEffectJunction');
goog.require('audioCat.audio.junction.effect.GainEffectJunction');
goog.require('audioCat.audio.junction.effect.PanEffectJunction');
goog.require('audioCat.audio.junction.effect.ReverbEffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EventType');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * A junction that allows for the combination of various effects. This node is
 * special in that it must be connected to a subsequent node in order for other
 * nodes to connect to it. This is because otherwise, some node might try to
 * connect with an empty set of effect nodes, which could err.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the (single-threaded) application.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @param {number} numberOfOutputChannels The number of output channels.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.effect.EffectManagerJunction = function(
    audioContextManager,
    effectManager,
    idGenerator,
    audioUnitConverter,
    numberOfOutputChannels) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.EFFECT_MANAGER);
  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {number}
   */
  this.numberOfOutputChannels_ = numberOfOutputChannels;

  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  var effectJunctions = [];
  /**
   * The junctions of effects to apply (in order).
   * @private {!Array.<!audioCat.audio.junction.effect.EffectJunction>}
   */
  this.effectJunctions_ = effectJunctions;
  var numberOfEffects = effectManager.getNumberOfEffects();
  var previousEffectJunction = null;
  for (var i = 0; i < numberOfEffects; ++i) {
    var effectJunction = this.createEffectJunction_(
        effectManager.getEffectAtIndex(i));
    effectJunctions.push(effectJunction);
    if (previousEffectJunction) {
      previousEffectJunction.connect(effectJunction);
    }
    previousEffectJunction = effectJunction;
  }

  /**
   * Manages effects in a certain segment of audio.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  // Respond to changes in effect addition, remove, swap.
  var listenFunction = goog.events.listen;
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);
};
goog.inherits(audioCat.audio.junction.effect.EffectManagerJunction,
    audioCat.audio.junction.Junction);

/**
 * Handles what happens when an effect is added.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The event.
 * @private
 */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.
    handleEffectAdded_ = function(event) {
  // Create the relevant effect junction.
  var effect = event.getEffect();
  var effectJunction = this.createEffectJunction_(effect);

  // Get index of addition.
  var effectJunctions = this.effectJunctions_;
  var insertionIndex = event.getIndex();

  // insert effect into array.
  if (insertionIndex == effectJunctions.length && this.nextJunction) {
    // This inserted effect is the last one, and we're connected to a node.
    effectJunction.connect(this.nextJunction);
  } else {
    // There will be an effect junction after this new one.
    var junctionFollowingThisNewOne = effectJunctions[insertionIndex];
    effectJunction.connect(junctionFollowingThisNewOne);
  }

  var indexBeforeThisOne = insertionIndex - 1;
  if (indexBeforeThisOne >= 0) {
    // Disconnect the effect before this one from the currently placed one.
    var junctionBeforeThisOne = effectJunctions[indexBeforeThisOne];
    junctionBeforeThisOne.disconnect();
    junctionBeforeThisOne.connect(effectJunction);
  }

  // Actually insert the new effect junction.
  goog.array.insertAt(effectJunctions, effectJunction, insertionIndex);

  // Emit an event noting that reconnection (and maybe restart) is needed.
  this.noteReconnectionNeeded_();
};

/**
 * Handles what happens when an effect is removed.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The event.
 * @private
 */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.
    handleEffectRemoved_ = function(event) {
  // Obtain the relevant effect junction.
  var effectJunctions = this.effectJunctions_;
  var removedIndex = event.getIndex();
  var removedEffectJunction = effectJunctions[removedIndex];
  goog.array.removeAt(effectJunctions, removedIndex);

  if (removedIndex) {
    // There exists some junction that preceded the removed junction.
    effectJunctions[removedIndex - 1].connect(
        /** @type {!audioCat.audio.junction.SubsequentJunction} */(
            removedEffectJunction.getNextJunction()));
  }

  // Clean up the removed junction.
  removedEffectJunction.cleanUp();

  // Emit an event noting that reconnection (and maybe restart) is needed.
  this.noteReconnectionNeeded_();
};

/**
 * Handles what happens when the index of an effect changes.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The event.
 * @private
 */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.
    handleEffectMoved_ = function(event) {
  var oldIndex = /** @type {number} */ (event.getPreviousIndex());
  var effectJunctions = this.effectJunctions_;
  var movedJunction = effectJunctions[oldIndex];
  var oldNextJunction =
      /** @type {!audioCat.audio.junction.SubsequentJunction} */ (
          movedJunction.getNextJunction());
  movedJunction.disconnect();

  if (oldIndex) {
    // The old index was not 0. Hook the previous junction to the next one.
    var precedingJunction = effectJunctions[oldIndex - 1];
    precedingJunction.disconnect();
    precedingJunction.connect(oldNextJunction);
  }
  goog.array.removeAt(effectJunctions, oldIndex);

  // Get the new index.
  var newIndex = event.getIndex();
  if (newIndex) {
    // Some junction precedes this one.
    var precedingJunction = effectJunctions[newIndex - 1];
    precedingJunction.disconnect();
    precedingJunction.connect(movedJunction);
  }

  // Connect the moved junction to either the subsequent junction or the next
  // filter junction.
  var nextJunction = this.getNextJunction();
  goog.asserts.assert(nextJunction, 'No next junction.');
  movedJunction.connect((newIndex < effectJunctions.length) ?
      effectJunctions[newIndex] : nextJunction);
  goog.array.insertAt(effectJunctions, movedJunction, newIndex);

  // Emit an event noting that reconnection (and maybe restart) is needed.
  this.noteReconnectionNeeded_();
};

/**
 * Dispatches an event noting that the previous node should reconnect to this
 * node. Dispatched if any connections are severed in between the effect
 * junctions.
 * @private
 */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.
    noteReconnectionNeeded_ = function() {
  this.dispatchEvent(audioCat.audio.junction.EventType.RECONNECT_REQUESTED);
};

/**
 * Creates the right effect junction based on the given effect.
 * @param {!audioCat.state.effect.Effect} effect The effect to create the
 *     junction for.
 * @return {!audioCat.audio.junction.effect.EffectJunction} The created effect
 *     junction that performs the effect.
 * @private
 */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.
    createEffectJunction_ = function(effect) {
  var effectTypeIdEnum = audioCat.state.effect.EffectId;
  var effectTypeId = effect.getModel().getEffectModelId();

  switch (effectTypeId) {
    case effectTypeIdEnum.ALLPASS:
    case effectTypeIdEnum.BANDPASS:
    case effectTypeIdEnum.HIGHPASS:
    case effectTypeIdEnum.HIGHSHELF:
    case effectTypeIdEnum.LOWPASS:
    case effectTypeIdEnum.LOWSHELF:
    case effectTypeIdEnum.NOTCH:
    case effectTypeIdEnum.PEAKING:
      goog.asserts.assert(
          effect instanceof audioCat.state.effect.FilterEffect,
          'Must use a filter effect for this case.');
      return new audioCat.audio.junction.effect.FilterEffectJunction(
          this.audioContextManager, this.idGenerator_, effect);
    case effectTypeIdEnum.GAIN:
      goog.asserts.assert(
          effect instanceof audioCat.state.effect.GainEffect,
          'Must use a gain effect for this case.');
      return new audioCat.audio.junction.effect.GainEffectJunction(
          this.audioContextManager, this.idGenerator_, effect,
          this.audioUnitConverter_, this.numberOfOutputChannels_);
    case effectTypeIdEnum.DYNAMIC_COMPRESSOR:
      goog.asserts.assert(
          effect instanceof audioCat.state.effect.DynamicCompressorEffect);
      return new audioCat.audio.junction.effect.DynamicCompressorEffectJunction(
          this.audioContextManager, this.idGenerator_, effect,
          this.audioUnitConverter_);
    case effectTypeIdEnum.PAN:
      goog.asserts.assert(effect instanceof audioCat.state.effect.PanEffect);
      return new audioCat.audio.junction.effect.PanEffectJunction(
          this.audioContextManager, this.idGenerator_, effect,
          this.audioUnitConverter_);
    case effectTypeIdEnum.REVERB:
      goog.asserts.assert(effect instanceof audioCat.state.effect.ReverbEffect);
      return new audioCat.audio.junction.effect.ReverbEffectJunction(
          this.audioContextManager, this.idGenerator_, effect,
          this.audioUnitConverter_, this.numberOfOutputChannels_);
  }
  goog.asserts.fail('The effect is not associated with a junction.');
};

/** @override */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.cleanUp =
    function() {
  if (this.cleanedUp) {
    return;
  }

  // Clean up the effect junctions.
  var effectJunctions = this.effectJunctions_;
  var numberOfEffects = effectJunctions.length;
  for (var i = 0; i < numberOfEffects; ++i) {
    effectJunctions[i].cleanUp();
  }

  // Stop listening to additions, removals, and moving of effects.
  var removeFunction = goog.events.unlisten;
  var effectManager = this.effectManager_;
  removeFunction(effectManager, audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);
  removeFunction(effectManager, audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);
  removeFunction(effectManager, audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);

  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.connect =
    function(junction) {
  // TODO(chizeng): If the last node ever changes, do a switcheroo and see
  // which is the last one connected.
  var effectJunctions = this.effectJunctions_;
  if (effectJunctions.length) {
    // We have at least 1 effect, so connect the last one to the next.
    effectJunctions[effectJunctions.length - 1].connect(junction);
    junction.addPreviousJunction(this);
  } else {
    // No effect junctions yet. Just defer to the subsequent junction.
    // Connecting to this node will later pick up the continuation.
    junction.addPreviousJunction(this);
  }
};

/** @override */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  var effectJunctions = this.effectJunctions_;
  var numberOfEffects = effectJunctions.length;
  if (numberOfEffects) {
    // At least 1 effect exists.
    return effectJunctions[0].obtainRawNode(opt_offlineAudioContext);
  }

  // A subsequent junction must exist.
  goog.asserts.assert(this.nextJunction);
  return this.nextJunction.obtainRawNode(opt_offlineAudioContext);
};

/** @override */
audioCat.audio.junction.effect.EffectManagerJunction.prototype.disconnect =
    function() {
  var effectJunctions = this.effectJunctions_;
  if (effectJunctions.length) {
    // Disconnect the last effect junction if it exists.
    effectJunctions[effectJunctions.length - 1].disconnect();
  }
  this.removeNextConnection();
};
