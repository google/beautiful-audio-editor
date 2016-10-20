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
