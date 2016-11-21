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
goog.provide('audioCat.ui.message.MessageType');


/**
 * Enumerates types of messages that can displayed to the user. Increment the
 * index below upon adding a new value.
 * Next available index: 5
 * @enum {number}
 */
audioCat.ui.message.MessageType = {
  DANGER: 1,
  INFO: 2,
  SUCCESS: 3,
  WARNING: 4
};
