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
goog.provide('audioCat.android.StringConstant');


/**
 * Enumerates string constants related to Android.
 * @enum {string}
 */
audioCat.android.StringConstant = {
  CLEAN_UP_FILE_WRITE_ATTEMPT: 'f', // Method for cleaning up after file write.
  SET_NEXT_FILE_INPUT_TYPE: 'a', // Method for setting the next file input type.
  REGISTER_PROJECT_FILE_WRITE: 'b', // Method for registering project f write.
  REGISTER_AUDIO_FILE_WRITE: 'c', // Method for registering audio file write.
  GET_FILE_WRITING_SOCKET: 'd', // Returns host + port string for socket.
  WRITE_FILE: 'e', // Method for triggering actual file write.
  ANDROID_OBJECT: '__and__' // The global name of the android object.
};
