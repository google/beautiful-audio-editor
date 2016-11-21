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
goog.provide('audioCat.action.ActionType');


/**
 * Enumerates types of actions. Increment the index below upon adding a new
 * action.
 * Next available index: 25
 * @enum {number}
 */
audioCat.action.ActionType = {
  CHANGE_EDIT_MODE: 4,
  CHECK_FOR_GENERIC_SAVE_NEEDED: 16,
  ISSUE_FEATURE_SUPPORT_COMPLAINTS: 10,
  ENCODE_PROJECT: 11,
  EXPORT: 5,
  DISPLAY_EFFECT_SELECTOR: 1,
  ACTUATE_PROJECT_STATE: 13,
  LOAD_PROJECT_STATE: 12,
  OPEN_LICENSE_VALIDATOR: 17,
  PLAY_PAUSE: 21,
  REDO: 20,
  RENDER_AUDIO_ACTION: 2,
  RENDER_TO_TRACK: 6,
  REQUEST_IMPORT_AUDIO: 3,
  SAVE_TO_SERVICE: 14,
  SNAP_TO_GRID: 7,
  SHOW_DOCUMENTATION: 15,
  TOGGLE_DEFAULT_RECORDING: 18,
  TOGGLE_SIGNATURE_TIME_GRID: 8,
  UNDO: 19,
  UNDO_REDO: 9,
  ZOOM_IN: 22,
  ZOOM_OUT: 23,
  ZOOM_TO_DEFAULT: 24
};
