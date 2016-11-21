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
goog.provide('audioCat.audio.record.RecordingAudioChestReadyEvent');

goog.require('audioCat.audio.record.Event');
goog.require('audioCat.utility.Event');


/**
 * An event fired when the audio rendered after a default recording has stopped
 * has been successfully made into an audio chest.
 * @param {!audioCat.audio.AudioChest} audioChest The chest of audio that had
 *     from the recording.
 * @param {number} beginTime The time at which the section begins on the track
 *     in seconds.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.record.RecordingAudioChestReadyEvent = function(
    audioChest, beginTime) {
  goog.base(this, audioCat.audio.record.Event.RECORDING_AUDIO_CHEST_READY);

  /**
   * @type {!audioCat.audio.AudioChest}
   */
  this.audioChest = audioChest;

  /**
   * @type {number}
   */
  this.beginTime = beginTime;
};
goog.inherits(audioCat.audio.record.RecordingAudioChestReadyEvent,
    audioCat.utility.Event);
