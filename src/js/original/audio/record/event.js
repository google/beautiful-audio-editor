goog.provide('audioCat.audio.record.Event');


/**
 * Enumerates events related to recording. After adding a new event type to this
 * list, increment the following letter.
 * Next available letter: 'i'
 * @enum {string}
 */
audioCat.audio.record.Event = {
  AUDIO_STREAM_FAILED_TO_OBTAIN: 'a', // Erred in obtaining audio media stream.
  DEFAULT_AUDIO_STREAM_OBTAINED: 'b', // Default Audio stream obtained.
  DEFAULT_RECORDING_JOB_CREATED: 'g', // Fired by recording manager.
  DEFAULT_RECORDING_STARTED: 'e', // Default recording started by recording job.
  DEFAULT_RECORDING_STOPPED: 'f', // Default recording stopped.
  READY_FOR_DEFAULT_RECORDING: 'c', // The recording manager is ready for ...
  RECORDING_AUDIO_CHEST_READY: 'h', // Recorded audio chest ready to use.
  MEDIA_STREAMED: 'd' // Some media was streamed.
};
