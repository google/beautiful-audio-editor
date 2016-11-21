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
goog.provide('audioCat.audio.junction.GainJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction for controlling gain.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} gain The initial gain value in sample units.
 * @param {number=} opt_numberOfOutputChannels The optional number of output
 *     channels. Unset if not provided.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.GainJunction = function(
    idGenerator,
    audioContextManager,
    gain,
    opt_numberOfOutputChannels) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.GAIN);

  /**
   * The gain node from the online audio context.
   * @private {!GainNode}
   */
  this.gainNode_ = audioContextManager.createGainNode();
  if (goog.isDef(opt_numberOfOutputChannels)) {
    audioContextManager.setChannelCount(
        this.gainNode_, opt_numberOfOutputChannels);
  }
  this.setGain(gain);
};
goog.inherits(audioCat.audio.junction.GainJunction,
    audioCat.audio.junction.Junction);

/**
 * Obtains the gain of the junction.
 * @param {!GainNode=} opt_gainNode Gets the gain of a different gain node if
 *     this argument is provided.
 * @return {number} The gain of the junction.
 */
audioCat.audio.junction.GainJunction.prototype.getGain =
    function(opt_gainNode) {
  return this.audioContextManager.getGain(opt_gainNode || this.gainNode_);
};

/**
 * Sets the gain of the junction.
 * @param {number} gain The gain to set.
 * @param {!GainNode=} opt_gainNode Sets the gain of a different gain node if
 *     this argument is provided.
 */
audioCat.audio.junction.GainJunction.prototype.setGain =
    function(gain, opt_gainNode) {
  this.audioContextManager.setGain(opt_gainNode || this.gainNode_, gain);
};

/** @override */
audioCat.audio.junction.GainJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.gainNode_.disconnect();
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.GainJunction.prototype.connect = function(junction) {
  this.gainNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.GainJunction.prototype.disconnect = function() {
  this.gainNode_.disconnect();
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.GainJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var audioContextManager = this.audioContextManager;
    var offlineGainNode = audioContextManager.createGainNode(
        opt_offlineAudioContext);
    audioContextManager.setChannelCount(
        offlineGainNode,
        audioContextManager.getChannelCount(this.gainNode_));
    this.setGain(audioContextManager.getGain(this.gainNode_), offlineGainNode);
    offlineGainNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineGainNode;
  }
  return this.gainNode_;
};
