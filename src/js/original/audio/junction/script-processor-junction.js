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
goog.provide('audioCat.audio.junction.ScriptProcessorJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that runs a script that alters input signal.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} numberOfChannels The number of channels.
 * @param {!function(!AudioProcessingEvent)} callback The function to call when
 *     new data is received.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.ScriptProcessorJunction =
    function(idGenerator, audioContextManager, numberOfChannels, callback) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.SCRIPT_PROCESSOR);

  /**
   * The number of channels.
   * @private {number}
   */
  this.numberOfChannels_ = numberOfChannels;

  /**
   * The script processor node.
   * @private {!ScriptProcessorNode}
   */
  this.scriptProcessorNode_ = audioContextManager.createScriptProcessorNode(
      numberOfChannels);
  this.scriptProcessorNode_.onaudioprocess = /** @type {!EventListener} */ (
      callback);
};
goog.inherits(audioCat.audio.junction.ScriptProcessorJunction,
    audioCat.audio.junction.Junction);

/**
 * @return {number} The number of input channels.
 */
audioCat.audio.junction.ScriptProcessorJunction.prototype.getNumberOfChannels =
    function() {
  return this.numberOfChannels_;
};

/** @override */
audioCat.audio.junction.ScriptProcessorJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.scriptProcessorNode_.disconnect();
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.ScriptProcessorJunction.prototype.connect =
    function(junction) {
  this.scriptProcessorNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.ScriptProcessorJunction.prototype.disconnect =
    function() {
  this.scriptProcessorNode_.disconnect();
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.ScriptProcessorJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var offlineNode = this.audioContextManager.createScriptProcessorNode(
        this.numberOfChannels_, opt_offlineAudioContext);
    offlineNode.onaudioprocess = this.scriptProcessorNode_.onaudioprocess;
    offlineNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineNode;
  }
  return this.scriptProcessorNode_;
};

