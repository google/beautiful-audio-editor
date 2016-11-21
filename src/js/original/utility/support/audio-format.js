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
goog.provide('audioCat.utility.support.AudioFormat');


/**
 * Encapsulates an audio format that can potentially be played.
 * @param {string} mimeType The MIME type string of the format.
 * @param {!Array.<!string>} extensions Extensions associated with the format.
 * @constructor
 */
audioCat.utility.support.AudioFormat = function(mimeType, extensions) {
  /**
   * @private {string}
   */
  this.mimeType_ = mimeType;

  /**
   * @private {!Array.<!string>}
   */
  this.extensions_ = extensions;
};

/**
 * @return {string} The MIME type.
 */
audioCat.utility.support.AudioFormat.prototype.getMimeType = function() {
  return this.mimeType_;
};

/**
 * @return {!Array.<string>} The list of extensions associated with this format.
 */
audioCat.utility.support.AudioFormat.prototype.getExtensions = function() {
  return this.extensions_;
};
