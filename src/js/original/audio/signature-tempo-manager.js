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
goog.provide('audioCat.audio.SignatureTempoManager');

goog.require('audioCat.audio.EventType');
goog.require('audioCat.utility.EventTarget');


/**
 * Manages the time signature and the tempo.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.SignatureTempoManager = function() {
  goog.base(this);

  /**
   * Beat unit. The beat that gets to take a beat. 4 means quarter note, 2 means
   * half. 1 means whole. 8 means eigth. And so on.
   * @private {number}
   */
  this.beatUnit_ = 4;

  /**
   * The number of beats in a bar (measure).
   * @private {number}
   */
  this.beatsInABar_ = 4;

  /**
   * The tempo in beats per minute.
   * @private {number}
   */
  this.tempo_ = 120;

  /**
   * The min tempo allowed.
   * @private {number}
   */
  this.minTempo_ = 24;

  /**
   * The max tempo allowed.
   * @private {number}
   */
  this.maxTempo_ = 240;
};
goog.inherits(
    audioCat.audio.SignatureTempoManager, audioCat.utility.EventTarget);

/**
 * @return {number} The current tempo in beats per minute.
 */
audioCat.audio.SignatureTempoManager.prototype.getTempo = function() {
  return this.tempo_;
};

/**
 * @return {number} The min tempo in beats per minute.
 */
audioCat.audio.SignatureTempoManager.prototype.getMinTempo = function() {
  return this.minTempo_;
};

/**
 * @return {number} The max tempo in beats per minute.
 */
audioCat.audio.SignatureTempoManager.prototype.getMaxTempo = function() {
  return this.maxTempo_;
};

/**
 * @return {number} The beat unit.
 */
audioCat.audio.SignatureTempoManager.prototype.getBeatUnit = function() {
  return this.beatUnit_;
};

/**
 * @return {number} The number of beats in a bar.
 */
audioCat.audio.SignatureTempoManager.prototype.getBeatsInABar = function() {
  return this.beatsInABar_;
};

/**
 * Sets the tempo. Assumes that the tempo is within [minTempo_, maxTempo_].
 * @param {number} tempo The tempo.
 * @param {boolean=} opt_silentlyChange If true, changes the beat unit without
 *     firing an event. Defaults to false.
 */
audioCat.audio.SignatureTempoManager.prototype.setTempo =
    function(tempo, opt_silentlyChange) {
  if (tempo == this.tempo_) {
    return;
  }
  this.tempo_ = tempo;
  if (!opt_silentlyChange) {
    this.dispatchEvent(audioCat.audio.EventType.TEMPO_CHANGED);
  }
};

/**
 * Sets the beat unit.
 * @param {number} beatUnit The beat unit.
 * @param {boolean=} opt_silentlyChange If true, changes the beat unit without
 *     firing an event. Defaults to false.
 */
audioCat.audio.SignatureTempoManager.prototype.setBeatUnit =
    function(beatUnit, opt_silentlyChange) {
  if (beatUnit == this.beatUnit_) {
    return;
  }
  this.beatUnit_ = beatUnit;
  if (!opt_silentlyChange) {
    this.dispatchEvent(audioCat.audio.EventType.BEAT_UNIT_CHANGED);
  }
};

/**
 * Sets the number of beats in a bar.
 * @param {number} beatsInABar The number of beats in a bar.
 * @param {boolean=} opt_silentlyChange If true, changes the number of beats in
 *     without firing an event. Defaults to false.
 */
audioCat.audio.SignatureTempoManager.prototype.setNumberOfBeatsInABar =
    function(beatsInABar, opt_silentlyChange) {
  if (beatsInABar == this.beatsInABar_) {
    return;
  }
  this.beatsInABar_ = beatsInABar;
  if (!opt_silentlyChange) {
    this.dispatchEvent(audioCat.audio.EventType.BEATS_IN_A_BAR_CHANGED);
  }
};
