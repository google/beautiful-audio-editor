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
