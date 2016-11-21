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
goog.provide('audioCat.audio.junction.ChannelSplitterJunction');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('goog.asserts');
goog.require('goog.object');


/**
 * Splits input into several channels, each of which can hook into a path of
 * junctions. Note that the default connect method of this junction does nothing
 * since it's not clear which channel we are connecting to.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number=} opt_outputChannelCount The number of output channels.
 *     Defaults to some constant.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.ChannelSplitterJunction =
    function(idGenerator, audioContextManager, opt_outputChannelCount) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.CHANNEL_SPLITTER);

  /**
   * The number of output channels.
   * @private {number}
   */
  this.outputChannelCount_ = opt_outputChannelCount ||
      audioCat.audio.Constant.DEFAULT_OUTPUT_CHANNEL_COUNT;

  /**
   * The channel splitter node.
   * @private {!ChannelSplitterNode}
   */
  this.splitterNode_ = audioContextManager.createChannelSplitterNode(
      this.outputChannelCount_);
  this.splitterNode_.channelInterpretation = 'discrete';

  /**
   * A mapping from the 0-indexed channel to the junction that channel is
   * connected to.
   * @private {!Object.<number, !audioCat.audio.junction.SubsequentJunction>}
   */
  this.channelToNextJunctionMapping_ = {};
};
goog.inherits(audioCat.audio.junction.ChannelSplitterJunction,
    audioCat.audio.junction.Junction);

/**
 * @return {number} The number of output channels.
 */
audioCat.audio.junction.ChannelSplitterJunction.prototype.
    getOutputChannelCount = function() {
  return this.outputChannelCount_;
};

/** @override */
audioCat.audio.junction.ChannelSplitterJunction.prototype.connect =
    function(junction) {
  goog.asserts.fail('The connect method does nothing.');
};

/**
 * Connects a channel to a junction.
 * @param {number} channelIndex The 0-based index of the channel to connect.
 * @param {!audioCat.audio.junction.SubsequentJunction} junction The junction to
 *     connect the channel to.
 */
audioCat.audio.junction.ChannelSplitterJunction.prototype.connectChannel =
    function(channelIndex, junction) {
  this.audioContextManager.connectSplitterChannel(
      this.splitterNode_, junction.obtainRawNode(), channelIndex);

  // If the channel had already been connected to some junction, disconnect it.
  var channelToNextJunctionMapping = this.channelToNextJunctionMapping_;
  if (channelToNextJunctionMapping[channelIndex]) {
    this.disconnectChannel(channelIndex);
  }

  // Remember that this channel is connected to {@code junction}.
  channelToNextJunctionMapping[channelIndex] = junction;

  // Normally we add a previous junction like this, but this time, we do not.
  // junction.addPreviousJunction(this);
};

/**
 * Disconnects a junction from a channel. The channel must be connected to
 * something.
 * @param {number} channelIndex The 0-based index of the channel to disconnect.
 */
audioCat.audio.junction.ChannelSplitterJunction.prototype.disconnectChannel =
    function(channelIndex) {
  goog.asserts.assert(this.channelToNextJunctionMapping_[channelIndex],
      'Channel ' + channelIndex + ' is not connected to any junction.');
  this.audioContextManager.disconnectSplitterChannel(
      this.splitterNode_, channelIndex);
  delete this.channelToNextJunctionMapping_[channelIndex];
};

/** @override */
audioCat.audio.junction.ChannelSplitterJunction.prototype.disconnect =
    function() {
  // This disconnects from all junctions we are connected to.
  goog.object.forEach(this.channelToNextJunctionMapping_,
      function(nextJunction, channelIndex) {
        this.disconnectChannel(channelIndex);
      }, this);
};

/** @override */
audioCat.audio.junction.ChannelSplitterJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var audioContextManager = this.audioContextManager;
    var offlineSplitterNode = audioContextManager.createChannelSplitterNode(
        audioContextManager.getNumberOfOutputChannels(this.splitterNode_),
        opt_offlineAudioContext);
    goog.object.forEach(this.channelToNextJunctionMapping_,
        function(nextJunction, channelIndex) {
          audioContextManager.connectSplitterChannel(
              offlineSplitterNode,
              nextJunction.obtainRawNode(opt_offlineAudioContext),
              channelIndex);
        }, this);
    return offlineSplitterNode;
  }
  return this.splitterNode_;
};

/** @override */
audioCat.audio.junction.ChannelSplitterJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.disconnect();
  this.cleanedUp = true;
};
