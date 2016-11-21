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
goog.provide('audioCat.audio.junction.VolumeEnvelopeJunction');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.state.envelope.events');
goog.require('goog.events');


/**
 * A junction for executing on the volume envelope.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.envelope.VolumeEnvelope} envelope The envelope to
 *     use.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between different units and standards within audio.
 * @param {number=} opt_numberOfOutputChannels The optional number of output
 *     channels. Unset if not provided.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.VolumeEnvelopeJunction = function(
    idGenerator,
    audioContextManager,
    envelope,
    audioUnitConverter,
    opt_numberOfOutputChannels) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.VOLUME_ENVELOPE);

  /**
   * The gain node for implementing the linear ramps.
   * @private {!GainNode}
   */
  this.gainNode_ = audioContextManager.createGainNode();
  if (goog.isDef(opt_numberOfOutputChannels)) {
    audioContextManager.setChannelCount(
        this.gainNode_, opt_numberOfOutputChannels);
  }

  /**
   * The envelope to use.
   * @private {!audioCat.state.envelope.VolumeEnvelope}
   */
  this.envelope_ = envelope;
};
goog.inherits(audioCat.audio.junction.VolumeEnvelopeJunction,
    audioCat.audio.junction.Junction);

/**
 * Sets the previous time in seconds into the audio at which audio started.
 * Makes calls for linear ramps to enforce the envelope.
 * @param {number} previousStartTime The time into the audio at which audio
 *     started playing in seconds.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to get the absolute
 *     time from. If not provided, uses the live audio context.
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.setStartIntoAudioTime =
    function(previousStartTime, opt_offlineAudioContext) {
  var audioContextManager = this.audioContextManager;

  // We must create a new gain node to discount the ramps made in the previous
  // use of this volume envelope junction.
  var newGainNode = audioContextManager.createGainNode(opt_offlineAudioContext);
  audioContextManager.setChannelCount(
      newGainNode, audioContextManager.getChannelCount(this.gainNode_));
  this.setValueAndRamps_(
      newGainNode, previousStartTime, opt_offlineAudioContext);

  // Recreate connections since we made a new gain node.
  if (opt_offlineAudioContext) {
    // Only update the current gain node if we are playing live, not rendering.
    return;
  }

  var oldGainNode = this.gainNode_;
  this.gainNode_ = newGainNode;
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
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to get the absolute
 *     time from. If not provided, uses the live audio context.
 * @private
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.setValueAndRamps_ =
    function(gainNode, startTime, opt_offlineAudioContext) {
  var defaultGain = 1.0;
  var envelope = this.envelope_;
  var numberOfControlPoints = envelope.getNumberOfControlPoints();
  var audioContextManager = this.audioContextManager;
  var audioParam = gainNode.gain;

  // Clear any existing ramps.
  audioParam.cancelScheduledValues(
      audioContextManager.getAbsoluteTime(opt_offlineAudioContext));

  if (numberOfControlPoints == 0) {
    // Well, having no control points makes things easy.
    audioParam.value = defaultGain;
    return;
  }

  var lastControlPointerIndex = numberOfControlPoints - 1;
  var currentControlPointIndex = lastControlPointerIndex;
  var lastRamp = true;
  while (currentControlPointIndex >= 0 &&
      startTime <= envelope.getControlPointAtIndex(
          currentControlPointIndex).getTime()) {
    // Set linear ramps from the last control point to the first one ahead of
    // the current absolute play time.
    var controlPoint = envelope.getControlPointAtIndex(
        currentControlPointIndex);
    var absoluteTime =
        audioContextManager.getAbsoluteTime(opt_offlineAudioContext) +
            controlPoint.getTime() - startTime;
    this.performRamp_(
        audioParam,
        controlPoint.getValue(),
        absoluteTime);
    if (lastRamp) {
      lastRamp = false;
      // If this was the last ramp to target, do one last ramp > 24 hours later
      // (basically guaranteeing that this will happen after the audio ends).
      // Otherwise, web audio has this weird bug in which if a final ramp begins
      // before a source node starts playing, the final ramp won't happen.
      this.performRamp_(
        audioParam,
        controlPoint.getValue(),
        absoluteTime + 1e5);
    }

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

  // Chrome drops the first ramp now and then. To counter this browser bug,
  // we just make a trivial ramp in the beginning.
  this.performRamp_(
      audioParam,
      startingValue,
      audioContextManager.getAbsoluteTime(opt_offlineAudioContext));
};

/**
 * Performs a ramp.
 * @param {AudioGain} audioParam The audio parameter to ramp.
 * @param {number} value The value to ramp to.
 * @param {number} absoluteTime The absolute time at which to reach that value.
 * @private
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.performRamp_ =
    function(audioParam, value, absoluteTime) {
  // This could either be linear or exponential ... haven't decided yet.
  this.performLinearRamp_(audioParam, value, absoluteTime);
};

/**
 * Performs a linear ramp.
 * @param {AudioGain} audioParam The audio parameter to ramp.
 * @param {number} value The value to ramp to.
 * @param {number} absoluteTime The absolute time at which to reach that value.
 * @private
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.performLinearRamp_ =
    function(audioParam, value, absoluteTime) {
  if (!audioParam) {
    // Weird, the audio param is null. According to the W3C interface, it can
    // happen at certain times.
    throw 2;
  }
  audioParam.linearRampToValueAtTime(value, absoluteTime);
};

/**
 * Performs an exponential ramp.
 * @param {AudioGain} audioParam The audio parameter to ramp.
 * @param {number} value The value to ramp to.
 * @param {number} absoluteTime The absolute time at which to reach that value.
 * @private
 */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.
    performExponentialRamp_ = function(audioParam, value, absoluteTime) {
  var lowestValue = audioCat.audio.Constant.MIN_VOLUME_FOR_EXPONENTIAL_RAMP;
  if (value < lowestValue) {
    // Never let the value fall <= 0 as that will trigger an error.
    value = lowestValue;
  }
  if (!audioParam) {
    // Weird, the audio param is null. According to the W3C interface, it can
    // happen at certain times.
    throw 2;
  }
  audioParam.exponentialRampToValueAtTime(value, absoluteTime);
};

/** @override */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.connect =
    function(junction) {
  this.gainNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.VolumeEnvelopeJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    var offlineGainNode = this.audioContextManager.createGainNode(
        opt_offlineAudioContext);
    this.audioContextManager.setChannelCount(
        offlineGainNode,
        this.audioContextManager.getChannelCount(this.gainNode_));
    this.setValueAndRamps_(
        offlineGainNode, 0, opt_offlineAudioContext);
    offlineGainNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineGainNode;
  }
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
