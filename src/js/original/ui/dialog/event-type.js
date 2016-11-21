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
goog.provide('audioCat.ui.dialog.EventType');

/**
 * Enumerates event types related to dialogs. When adding a new type, increment
 * the letter below to maintain unique names.
 * Next available letter index: c
 */
audioCat.ui.dialog.EventType = {
  BEFORE_HIDDEN: 'a',
  HIDE_DIALOG_REQUESTED: 'b'
};
