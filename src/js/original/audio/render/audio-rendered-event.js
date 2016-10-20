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
