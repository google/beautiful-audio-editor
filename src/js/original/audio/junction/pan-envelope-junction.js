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
// This whole file ... uh, doesn't even work. Just ignore it. As of 01/19/2015,
// the web audio api lacks linear ramps for panner nodes.

goog.provide('audioCat.audio.junction.PanEnvelopeJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.state.envelope.events');
goog.require('goog.events');


/**
 * A junction for executing on the pan envelope.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.envelope.PanEnvelope} envelope The envelope to
 *     use.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.PanEnvelopeJunction =
    function(idGenerator, audioContextManager, envelope) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.PAN_ENVELOPE);

  /**
   * The gain node for implementing the linear ramps.
   * @private {!GainNode}
   */
  this.gainNode_ = audioContextManager.createGainNode();

  /**
   * The envelope to use.
   * @private {!audioCat.state.envelope.VolumeEnvelope}
   */
  this.envelope_ = envelope;

  /**
   * The time into the audio in seconds at which the audio started.
   * @private {number}
   */
  this.previousStartIntoAudioTime_ = 0;

  /**
   * The absolute times at which previous ramps were set up. The ramps are
   * undone the next time the envelope changes so that old ramps don't affect
   * new ones.
   * @private {!Array.<number>}
   */
  this.previousRamps_ = [];

  /**
   * Previous absolute ramp change time in seconds. Meaningless if no previous
   * ramps done.
   * @private {number}
   */
  this.previousRampChangeAbsoluteTime_ = 0;
};
goog.inherits(audioCat.audio.junction.VolumeEnvelopeJunction,
    audioCat.audio.junction.Junction);

/**
 * Sets the previous time in seconds into the audio at which audio started.
 * Makes calls for linear ramps to enforce the envelope.
 * @param {number} previousStartTime The time into the audio at which audio
 *     started playing in seconds.
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.setStartIntoAudioTime =
    function(previousStartTime) {
  var audioContextManager = this.audioContextManager;
  this.previousStartIntoAudioTime_ = previousStartTime;
  this.previousStartAbsoluteTime_ = audioContextManager.getAbsoluteTime();

  // We must create a new gain node to discount the ramps made in the previous
  // use of this volume envelope junction.
  var newGainNode = audioContextManager.createGainNode();
  this.setValueAndRamps_(newGainNode, previousStartTime);

  // Recreate connections since we made a new gain node.
  var oldGainNode = this.gainNode_;
  this.gainNode_ = newGainNode;
  if (this.previousJunction) {
    this.previousJunction.connect(this);
  }
  if (this.nextJunction) {
    this.connect(/** @type {!audioCat.audio.junction.SubsequentJunction} */ (
        this.nextJunction));
  }
  oldGainNode.disconnect();
};

/**
 * Sets value and gain ramps based on the previous start time and the envelope.
 * @param {!GainNode} gainNode The gain node to use.
 * @param {number} startTime The start time into the audio in seconds to use for
 *     ramp calculations.
 * @private
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.setValueAndRamps_ =
    function(gainNode, startTime) {
  var defaultGain = 1.0;
  var envelope = this.envelope_;
  var numberOfControlPoints = envelope.getNumberOfControlPoints();
  var audioContextManager = this.audioContextManager;
  var audioParam = gainNode.gain;
  this.previousRampChangeAbsoluteTime_ = audioContextManager.getAbsoluteTime();

  // Undo previous ramps.
  // TODO(chizeng): This undoing of ramps with other ramps is hackish and not
  // reliable. Find a better way to do this.

  // TODO(chizeng): To solve this problem, have the track entry stop playing,
  // call a function that re-creates the gain node and the ramps, and then
  // replays from the beginning.
  var previousRamps = this.previousRamps_;
  audioParam.value = defaultGain;
  for (var i = 0; i < previousRamps.length; ++i) {
    var absoluteTime = previousRamps[i] -
        (audioContextManager.getAbsoluteTime() -
            this.previousRampChangeAbsoluteTime_);
    if (absoluteTime > this.previousRampChangeAbsoluteTime_) {
      audioParam.linearRampToValueAtTime(defaultGain, absoluteTime);
    }
  }
  previousRamps.length = 0;

  if (numberOfControlPoints == 0) {
    audioParam.value = defaultGain;
  } else {
    var lastControlPointerIndex = numberOfControlPoints - 1;
    var currentControlPointIndex = lastControlPointerIndex;
    while (currentControlPointIndex >= 0 &&
        startTime <= envelope.getControlPointAtIndex(
            currentControlPointIndex).getTime()) {
      // Set linear ramps from the last control point to the first one ahead of
      // the current absolute play time.
      var controlPoint = envelope.getControlPointAtIndex(
          currentControlPointIndex);
      var absoluteTime = audioContextManager.getAbsoluteTime() +
          controlPoint.getTime() - startTime;
      audioParam.linearRampToValueAtTime(controlPoint.getValue(), absoluteTime);
      previousRamps.push(absoluteTime);
      --currentControlPointIndex;
    }

    // Set the initial value upon starting.
    var startingValue;
    if (currentControlPointIndex == -1) {
      // No control point before the start time.
      startingValue = envelope.getControlPointAtIndex(0).getValue();
    } else if (currentControlPointIndex == lastControlPointerIndex) {
      // No control points follow the start time.
      startingValue = envelope.getControlPointAtIndex(
          lastControlPointerIndex).getValue();
    } else {
      // The start time is in between 2 control points.
      var controlPointA = envelope.getControlPointAtIndex(
          currentControlPointIndex);
      var controlPointB = envelope.getControlPointAtIndex(
          currentControlPointIndex + 1);
      var time0 = controlPointA.getTime();
      var timeRatio = (startTime - time0) /
          (controlPointB.getTime() - time0);
      var value0 = controlPointA.getValue();
      startingValue = value0 + timeRatio * (controlPointB.getValue() - value0);
    }
    audioParam.value = startingValue;
  }
};

/** @override */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.connect =
    function(junction) {
  this.gainNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.obtainRawNode =
    function() {
  // TODO(chizeng): Handle offline pan envelope junction.
  return this.gainNode_;
};

/** @override */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.gainNode_.disconnect();
  this.cleanedUp = true;
};
