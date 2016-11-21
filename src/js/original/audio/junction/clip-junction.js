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
goog.provide('audioCat.audio.junction.ClipJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.StartJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction for playing the sound in a clip.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.state.Section} section The section that the clip belongs
 *     to. Needed to compute the begin time of clip play.
 * @param {!audioCat.audio.AudioChest} audioChest The chest from which the audio
 *     was taken from.
 * @param {!audioCat.state.Clip} clip The added clip.
 * @param {number} timeBegin The duration at which the clip was added in
 *     seconds relative to the beginning of the section.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.StartJunction}
 */
audioCat.audio.junction.ClipJunction = function(
    idGenerator,
    audioContextManager,
    section,
    audioChest,
    clip,
    timeBegin) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.CLIP);

  /**
   * The section of audio that the clip belongs to.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * The clip this junction is for.
   * @private {!audioCat.state.Clip}
   */
  this.clip_ = clip;

  // TODO(chizeng): Change the duration when the clip's duration changes.
  /**
   * The duration of the clip.
   * @private {number}
   */
  this.duration_ = this.computeDuration_();

  /**
   * The begin time of this clip relative to the begin time of its track.
   * @private {number}
   */
  this.timeBegin_ = timeBegin;

  /**
   * The last source node used to start this node if this node has been started.
   * If this junction has not been started, null.
   * @private {AudioSourceNode}
   */
  this.lastAudioSourceNodeUsed_ = null;
};
goog.inherits(audioCat.audio.junction.ClipJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.ClipJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }
  // TODO(chizeng): Later, remove listeners for clip change.
  if (this.lastAudioSourceNodeUsed_) {
    this.lastAudioSourceNodeUsed_.disconnect();
    this.lastAudioSourceNodeUsed_ = null;
  }
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.ClipJunction.prototype.start =
    function(time, opt_offlineAudioContext) {
  var nextJunction = this.nextJunction;
  if (!nextJunction) {
    // Can't start a starting node if it's not connected to anything.
    return;
  }

  var audioContextManager = this.audioContextManager;
  var playbackRate = this.section_.getPlaybackRate();
  var sectionBeginTime = this.section_.getBeginTime();
  var timeTillClip = sectionBeginTime + this.timeBegin_ - time;
  var clipDuration = this.duration_;
  var clipDurationWithPlaybackRate = clipDuration / playbackRate;
  if (clipDurationWithPlaybackRate + timeTillClip < 0) {
    // The current play time is after the clip ends. Do nothing.
    return;
  }
  var sourceNode = audioContextManager.createSourceNode(
      this.section_.getAudioChest(), opt_offlineAudioContext);

  // If we're rendering offline, connect to the offline node instead.
  sourceNode.connect(nextJunction.obtainRawNode(opt_offlineAudioContext));

  var offsetIntoAudioChest = this.section_.computeDurationFromSamples(
      this.clip_.getBeginSampleIndex());
  var offsetIntoClipAlone = 0;
  var startFirstArgumentDelay;
  if (timeTillClip > 0) {
    // We wait a bit before playing this clip.
    startFirstArgumentDelay = timeTillClip;
  } else {
    // This clip is to be played, but play starts in the middle.
    startFirstArgumentDelay = 0;
    var timeTillClipWithPlaybackConsidered = timeTillClip * playbackRate;
    offsetIntoAudioChest -= timeTillClipWithPlaybackConsidered;
    offsetIntoClipAlone -= timeTillClipWithPlaybackConsidered;
  }
  if (!opt_offlineAudioContext) {
    // If we're playing live (not rendering offline), remember the last source
    // node we created so that we can use it to stop play.
    this.lastAudioSourceNodeUsed_ = sourceNode;
  }
  audioContextManager.setPlaybackRate(sourceNode, playbackRate);
  sourceNode.start(
      audioContextManager.getAbsoluteTime(opt_offlineAudioContext) +
          startFirstArgumentDelay,
      offsetIntoAudioChest, clipDuration - offsetIntoClipAlone);
};

/** @override */
audioCat.audio.junction.ClipJunction.prototype.stop = function() {
  var lastAudioSourceNodeUsed = this.lastAudioSourceNodeUsed_;
  if (lastAudioSourceNodeUsed) {
    lastAudioSourceNodeUsed.stop();
    lastAudioSourceNodeUsed.disconnect();
  }
};

/** @override */
audioCat.audio.junction.ClipJunction.prototype.connect = function(junction) {
  // The call to this function defines this.nextJunction for us.
  junction.addPreviousJunction(this);
};

/**
 * Computes the duration of the clip.
 * @return {number} The clip's duration in seconds.
 * @private
 */
audioCat.audio.junction.ClipJunction.prototype.computeDuration_ = function() {
  var clip = this.clip_;
  return (clip.getRightSampleBound() - clip.getBeginSampleIndex()) /
      this.section_.getAudioChest().getSampleRate();
};
