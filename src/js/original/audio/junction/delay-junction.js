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
goog.provide('audioCat.audio.junction.DelayJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');

// The max delay in seconds each individual delay node can handle. Google Chrome
// limits each delay node's max delay to 180 seconds (exclusive).
var maxDelayNodeTime = 150;


/**
 * A junction that produces delay.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} maxDelay The max delay possible for the delay node. Will be
 *     changed later if the delay exceeds it.
 * @param {number} delayValue The current value of the delay in seconds.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.DelayJunction =
    function(idGenerator, audioContextManager, maxDelay, delayValue) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.DELAY);

  // This list will always have 1 delay node.
  var delayNode = audioContextManager.createDelayNode(maxDelayNodeTime);
  /**
   * A list of delay nodes.
   * @private {!Array.<!DelayNode>}
   */
  this.delayNodes_ = [delayNode];

  /**
   * The current max delay.
   * @private {number}
   */
  this.maxDelay_ = maxDelay;

  /**
   * The current delay value in seconds.
   * @private {number}
   */
  this.delayValue_ = delayValue;

  this.setDelay(delayValue);
};
goog.inherits(audioCat.audio.junction.DelayJunction,
    audioCat.audio.junction.Junction);

/**
 * @override
 * @suppress {checkTypes}
 */
audioCat.audio.junction.DelayJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  // TODO(chizeng): Disconnect all the delay nodes.
  var delayNodes = this.delayNodes_;
  var numberOfDelayNodes = delayNodes.length;
  for (var i = 0; i < numberOfDelayNodes; ++i) {
    delayNodes[i].disconnect();
  }
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.DelayJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    // Mimic the other delay nodes.
    var audioContextManager = this.audioContextManager;
    var delayNodes = this.delayNodes_;
    var firstOfflineDelayNode = audioContextManager.createDelayNode(
        maxDelayNodeTime, opt_offlineAudioContext);
    firstOfflineDelayNode.delayTime.value = delayNodes[0].delayTime.value;
    var currentDelayNode = firstOfflineDelayNode;
    for (var i = 1; i < delayNodes.length; ++i) {
      var newDelayNode = audioContextManager.createDelayNode(
        maxDelayNodeTime, opt_offlineAudioContext);
      var currentDelayNode.connect(newDelayNode);
      newDelayNode.delayTime.value = delayNodes[i].delayTime.value;
      currentDelayNode = newDelayNode;
    }
    currentDelayNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return firstOfflineDelayNode;
  }
  // TODO(chizeng): Return just the 1st delay node, which always exists.
  return this.delayNodes_[0];
};

/**
 * Sets the delay.
 * @param {number} delayTime The new delay in seconds.
 */
audioCat.audio.junction.DelayJunction.prototype.setDelay =
    function(delayTime) {
  var delayNodesNeeded = Math.max(1, Math.ceil(delayTime / maxDelayNodeTime));
  var delayNodes = this.delayNodes_;
  var numberOfPreviousDelayNodes = delayNodes.length - 1;
  if (delayNodes.length == delayNodesNeeded) {
    // No removal or addition of delay nodes needed.
    delayNodes[numberOfPreviousDelayNodes].delayTime.value =
        delayTime - (maxDelayNodeTime * numberOfPreviousDelayNodes);
    return;
  }

  delayNodes[numberOfPreviousDelayNodes].disconnect();
  delayNodes.length = 1;
  var audioContextManager = this.audioContextManager;
  for (var i = 1; i < delayNodesNeeded; ++i) {
    var delayNode = audioContextManager.createDelayNode(maxDelayNodeTime);
    delayNode.delayTime.value = maxDelayNodeTime;
    delayNodes[i - 1].connect(delayNode);
    delayNodes.push(delayNode);
  }
  numberOfPreviousDelayNodes = delayNodes.length - 1;
  var lastDelayNode = delayNodes[numberOfPreviousDelayNodes];
  lastDelayNode.delayTime.value =
      delayTime - (maxDelayNodeTime * numberOfPreviousDelayNodes);
  this.delayValue_ = delayTime;
  if (this.nextJunction) {
    lastDelayNode.connect(this.nextJunction.obtainRawNode());
  }
};

/** @override */
audioCat.audio.junction.DelayJunction.prototype.addPreviousJunction =
    function(junction) {
  this.previousJunctions[junction.getId()] = junction;
};

/** @override */
audioCat.audio.junction.DelayJunction.prototype.connect = function(junction) {
  var delayNodes = this.delayNodes_;
  delayNodes[delayNodes.length - 1].connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};
