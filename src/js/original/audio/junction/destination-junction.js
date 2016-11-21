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
goog.provide('audioCat.audio.junction.DestinationJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that marks the output for audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.DestinationJunction =
    function(idGenerator, audioContextManager) {
  /**
   * The destination node for play.
   * @private {!AudioDestinationNode}
   */
  this.audioDestinationNode_ = audioContextManager.createAudioDestinationNode();

  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.DESTINATION);
};
goog.inherits(audioCat.audio.junction.DestinationJunction,
    audioCat.audio.junction.Junction);

/** @inheritDoc */
audioCat.audio.junction.DestinationJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    return this.audioContextManager.createAudioDestinationNode(
        opt_offlineAudioContext);
  }
  return this.audioDestinationNode_;
};

/** @inheritDoc */
audioCat.audio.junction.DestinationJunction.prototype.connect =
    function(junction) {
  // The destination junction should not be able to connect anything.
  return;
};
