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
goog.provide('audioCat.audio.junction.NewImpulseResponseNeededEvent');

goog.require('audioCat.audio.junction.EventType');
goog.require('audioCat.utility.Event');



/**
 * Event fired when new impulse response for the convolver node is needed. If
 * the sample rate of the audio buffer for the convolver node does not match
 * that of the audio context (offline or not), then an exception occurs. This
 * thwarts rendering: https://news.ycombinator.com/item?id=8803223
 * @param {number} sampleRate The sample rate of the relevant audio context.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.junction.NewImpulseResponseNeededEvent = function(sampleRate) {
  /**
   * The sample rate of the audio context.
   * @type {number}
   */
  this.sampleRate = sampleRate;

  audioCat.audio.junction.NewImpulseResponseNeededEvent.base(
      this,
      'constructor',
      audioCat.audio.junction.EventType.NEW_IMPULSE_RESPONSE_NEEDED);
};
goog.inherits(audioCat.audio.junction.NewImpulseResponseNeededEvent,
    audioCat.utility.Event);
