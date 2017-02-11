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
goog.provide('audioCat.state.plan.Constant');
goog.provide('audioCat.state.plan.NumericConstant');


/**
 * Enumerates constants related to encoding and decoding projects.
 * @const {!Object.<string, string>}
 */
audioCat.state.plan.Constant = {
  FILE_INITIAL_MARK: 'audioproject',
  PROJECT_EXTENSION: 'audioproject',
  PROJECT_MIME_TYPE: 'application/audioproject'
};

/**
 * Enumerates numeric constants related to encoding and decoding projects.
 * @enum {number}
 */
audioCat.state.plan.NumericConstant = {
  // Leave some buffer room to add new features in project files. How much?
  TOTAL_BUFFER_SPACE_IN_INTS: 20
};
