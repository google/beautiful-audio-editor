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
goog.provide('audioCat.audio.render.ExportingProgressEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');
goog.require('goog.asserts');


/**
 * An event fired when exporting a certain format progresses
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {number} progress The fraction out of 1 denoting how much progress has
 *     been made.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.ExportingProgressEvent = function(format, progress) {
  goog.base(this, audioCat.audio.render.EventType.EXPORTING_PROGRESS);

  /**
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;

  /**
   * @private {number}
   */
  this.progress_ = progress;
  goog.asserts.assert(progress >= 0);
  goog.asserts.assert(progress <= 1);
};
goog.inherits(audioCat.audio.render.ExportingProgressEvent,
    audioCat.utility.Event);

/**
 * @return {audioCat.audio.render.ExportFormat} The export format.
 */
audioCat.audio.render.ExportingProgressEvent.prototype.getFormat = function() {
  return this.format_;
};

/**
 * @return {number} The fraction of progress made so far.
 */
audioCat.audio.render.ExportingProgressEvent.prototype.getProgress =
    function() {
  return this.progress_;
};
