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
