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
goog.provide('audioCat.audio.render.ExportingFailedEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event fired when exporting a certain format fails.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {string=} opt_errorMessage The error message if any.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.ExportingFailedEvent = function(
    format, opt_errorMessage) {
  goog.base(this, audioCat.audio.render.EventType.EXPORTING_FAILED);

  /**
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;

  /**
   * The error message May be an empty string.
   * @private {string}
   */
  this.errorMessage_ = opt_errorMessage || '';
};
goog.inherits(audioCat.audio.render.ExportingFailedEvent,
    audioCat.utility.Event);

/**
 * @return {audioCat.audio.render.ExportFormat} The export format.
 */
audioCat.audio.render.ExportingFailedEvent.prototype.getFormat = function() {
  return this.format_;
};

/**
 * @return {string} The error message. May be an empty string.
 */
audioCat.audio.render.ExportingFailedEvent.prototype.getErrorMessage =
    function() {
  return this.errorMessage_;
};
