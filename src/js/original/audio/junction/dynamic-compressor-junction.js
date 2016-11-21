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
goog.provide('audioCat.audio.junction.DynamicCompressorJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that applies dynamic compression.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} attack The initial attack value.
 * @param {number} knee The initial knee value.
 * @param {number} ratio The initial ratio value.
 * @param {number} release The initial release value.
 * @param {number} threshold The initial threshold value.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.DynamicCompressorJunction = function(
    idGenerator,
    audioContextManager,
    attack,
    knee,
    ratio,
    release,
    threshold) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.DYNAMIC_COMPRESSOR);

  /**
   * The dynamic compressor node from the online audio context.
   * @protected {!DynamicsCompressorNode}
   */
  this.dynamicCompressorNode =
      audioContextManager.createDynamicCompressorNode();
  audioContextManager.setAttack(this.dynamicCompressorNode, attack);
  audioContextManager.setKnee(this.dynamicCompressorNode, knee);
  audioContextManager.setRatio(this.dynamicCompressorNode, ratio);
  audioContextManager.setRelease(this.dynamicCompressorNode, release);
  audioContextManager.setThreshold(this.dynamicCompressorNode, threshold);
};
goog.inherits(audioCat.audio.junction.DynamicCompressorJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.DynamicCompressorJunction.prototype.cleanUp =
    function() {
  if (this.cleanedUp) {
    return;
  }

  this.dynamicCompressorNode.disconnect();
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.DynamicCompressorJunction.prototype.connect =
    function(junction) {
  this.dynamicCompressorNode.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.DynamicCompressorJunction.prototype.disconnect =
    function() {
  this.dynamicCompressorNode.disconnect();
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.DynamicCompressorJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var audioContextManager = this.audioContextManager;
    var offlineNode = audioContextManager.createDynamicCompressorNode(
        opt_offlineAudioContext);
    // Imitate the online node.
    audioContextManager.setAttack(
        offlineNode,
        audioContextManager.getAttack(this.dynamicCompressorNode));
    audioContextManager.setKnee(
        offlineNode,
        audioContextManager.getKnee(this.dynamicCompressorNode));
    audioContextManager.setRelease(
        offlineNode,
        audioContextManager.getRelease(this.dynamicCompressorNode));
    audioContextManager.setRatio(
        offlineNode,
        audioContextManager.getRatio(this.dynamicCompressorNode));
    audioContextManager.setReduction(
        offlineNode,
        audioContextManager.getReduction(this.dynamicCompressorNode));
    audioContextManager.setThreshold(
        offlineNode,
        audioContextManager.getThreshold(this.dynamicCompressorNode));
    offlineNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineNode;
  }
  return this.dynamicCompressorNode;
};
