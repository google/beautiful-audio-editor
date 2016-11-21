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
