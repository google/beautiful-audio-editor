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
goog.provide('audioCat.audio.junction.PanJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction for controlling pan.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {number} pan The initial pan value.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.PanJunction =
    function(idGenerator, audioContextManager, pan) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.PAN);

  /**
   * The current pan value.
   * @private {number}
   */
  this.currentPan_ = pan;

  /**
   * The pan node from the online audio context.
   * @private {!AudioPannerNode}
   */
  this.panNode_ = audioContextManager.createPanNode();
  var pannerNode = this.panNode_;
  pannerNode.panningModel = 'equalpower';
  
  // setVelocity has not effect any more.
  // pannerNode.setVelocity(0, 0, 0);
  
  pannerNode.distanceModel = 'inverse';
  pannerNode.refDistance = 1;
  pannerNode.maxDistance = 10000;
  pannerNode.rolloffFactor = 1;
  pannerNode.coneInnerAngle = 360;
  pannerNode.coneOuterAngle = 0;
  pannerNode.coneOuterGain = 0;
  pannerNode.setOrientation(1, 0, 0);

  var listener = audioContextManager.getListener();

  // TODO(chizeng): Verify that these fields are deprecated.
  // listener.dopplerFactor = 1;
  // listener.speedOfSound = 343.3;

  listener.setOrientation(0, 0, -1, 0, 1, 0);
  this.setPan(pan);
};
goog.inherits(audioCat.audio.junction.PanJunction,
    audioCat.audio.junction.Junction);

/**
 * @override
 * @suppress {checkTypes}
 */
audioCat.audio.junction.PanJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.panNode_.disconnect();
  this.cleanedUp = true;
};

/**
 * Sets the pan of the junction.
 * @param {number} pan The pan to set.
 */
audioCat.audio.junction.PanJunction.prototype.setPan =
    function(pan) {
  this.setPanForPannerNode_(this.panNode_, pan);
  this.currentPan_ = pan;
};

/**
 * Sets the pan of the junction.
 * @param {!AudioPannerNode} pannerNode Sets the pan for this panner node.
 * @param {number} pan The pan to set.
 * @private
 */
audioCat.audio.junction.PanJunction.prototype.setPanForPannerNode_ =
    function(pannerNode, pan) {
  var x = pan / 45;
  var y = 0;
  var z = x < 0 ? 1 + x : 1 - x;
  pannerNode.setPosition(x, y, z);

  // TODO(chizeng): Determine whether to use this more natural, but less
  // intensive pan. This latter pan should not use the equal power model.
  //
  // var xDeg = pan;
  // var zDeg = xDeg + 90;
  // if (zDeg > 90) {
  //   zDeg = 180 - zDeg;
  // }
  // var x = Math.sin(xDeg * (Math.PI / 180));
  // var z = Math.sin(zDeg * (Math.PI / 180));
  // pannerNode.setPosition(x, 0, z);
};

/** @override */
audioCat.audio.junction.PanJunction.prototype.connect = function(junction) {
  this.panNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.PanJunction.prototype.disconnect = function() {
  this.panNode_.disconnect();
  // Removes javascript stores of previous/next node links.
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.PanJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var offlinePanNode = this.audioContextManager.createPanNode(
        opt_offlineAudioContext);
    this.setPanForPannerNode_(offlinePanNode, this.currentPan_);
    offlinePanNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlinePanNode;
  }
  return this.panNode_;
};
