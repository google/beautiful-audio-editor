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
goog.provide('audioCat.audio.render.AudioRenderedEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event noting that audio has finished rendering.
 * @param {!audioCat.utility.Id} renderId The ID of this rendering operation.
 *     Each rendering operation has its own ID.
 * @param {!AudioBuffer} audioBuffer The audio buffer containing the rendered
 *     audio.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.AudioRenderedEvent = function(renderId, audioBuffer) {
  goog.base(this, audioCat.audio.render.EventType.AUDIO_RENDERED);
  /**
   * @private {!audioCat.utility.Id}
   */
  this.renderId_ = renderId;

  /**
   * The audio buffer containing the rendered audio.
   * @private {!AudioBuffer}
   */
  this.audioBuffer_ = audioBuffer;
};
goog.inherits(audioCat.audio.render.AudioRenderedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.utility.Id} The ID of the rendering operation that had
 *     just finished.
 */
audioCat.audio.render.AudioRenderedEvent.prototype.getRenderId = function() {
  return this.renderId_;
};

/**
 * @return {!AudioBuffer} The audio buffer containing the rendered audio.
 */
audioCat.audio.render.AudioRenderedEvent.prototype.getAudioBuffer = function() {
  return this.audioBuffer_;
};
