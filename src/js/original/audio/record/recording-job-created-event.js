goog.provide('audioCat.audio.record.RecordingJobCreatedEvent');

goog.require('audioCat.audio.record.Event');
goog.require('audioCat.utility.Event');


/**
 * An event marking the creation of a new recording job.
 * @param {!audioCat.audio.record.RecordingJob} recordingJob The newly created
 *     job recording.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.record.RecordingJobCreatedEvent = function(recordingJob) {
  goog.base(this, audioCat.audio.record.Event.DEFAULT_RECORDING_JOB_CREATED);

  /**
   * The newly made recording job.
   * @type {!audioCat.audio.record.RecordingJob}
   */
  this.recordingJob = recordingJob;
};
goog.inherits(
    audioCat.audio.record.RecordingJobCreatedEvent, audioCat.utility.Event);
