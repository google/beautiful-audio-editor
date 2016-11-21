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
goog.provide('audioCat.audio.StartNodeAccumulator');


/**
 * An entry in the start node accumulator. Stores the starting node as well as
 * the offset into the audio to start the node. This is not a public class.
 * @param {!AudioSourceNode} sourceNode The source node to start.
 * @param {number} offset The offset in seconds into the audio to start at.
 * @param {number} duration The duration in seconds to play the audio for.
 * @constructor
 */
audioCat.audio.StartNodeAccumulatorEntry =
    function(sourceNode, offset, duration) {
  /**
   * The source node to start.
   * @public {!AudioSourceNode}
   */
  this.sourceNode = sourceNode;

  /**
   * The offset in seconds into the audio at which to start.
   * @public {number}
   */
  this.offset = offset;

  /**
   * The duration in seconds to play the audio for.
   * @public {number}
   */
  this.duration = duration;
};

/**
 * Accumulates starting nodes for starting at around the same time as well as
 * conveniently stopping.
 * @constructor
 */
audioCat.audio.StartNodeAccumulator = function() {
  /**
   * The list of start nodes accumulated for starting.
   * @private {!Array.<!audioCat.audio.StartNodeAccumulatorEntry>}
   */
  this.stagedStartNodes_ = [];
};

/**
 * Adds a start node to the list of nodes to staged to start soon.
 * @param {!AudioSourceNode} sourceNode The source node to start.
 * @param {number} offset The offset in seconds into the audio to start at.
 * @param {number} duration The duration in seconds to play the audio for.
 */
audioCat.audio.StartNodeAccumulator.prototype.addStartNode =
    function(sourceNode, offset, duration) {
  this.stagedStartNodes_.push(new audioCat.audio.StartNodeAccumulatorEntry(
      sourceNode, offset, duration));
};

/**
 * Triggers all the start nodes to start playing. Call this function after all
 * the start nodes have been staged. Empties the list of staged nodes
 * afterwards to prepare for the next play.
 */
audioCat.audio.StartNodeAccumulator.prototype.triggerStarts = function() {
  var stagedStartNodes = this.stagedStartNodes_;
  var numberOfStagedStartNodes = stagedStartNodes.length;
  for (var i = 0; i < numberOfStagedStartNodes; ++i) {
    var stagedStartNodeEntry = stagedStartNodes[i];
    stagedStartNodeEntry.sourceNode.start(
        0, stagedStartNodeEntry.offset, stagedStartNodeEntry.duration);
  }
};

/**
 * Stops all start nodes.
 */
audioCat.audio.StartNodeAccumulator.prototype.emptyStartNodes = function() {
  this.stagedStartNodes_.length = 0;
};
