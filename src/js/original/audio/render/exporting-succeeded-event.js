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
goog.provide('audioCat.audio.render.ExportingSucceededEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event fired when exporting succeeds.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {string} fileName Name of the exported file.
 * @param {string} url The download URL. This is usually a browser-generated
 *     object URL. We may at times return a data URL though to say pass on to
 *     Android java.
 * @param {number} fileSizeInBytes The size of the exported file in bytes.
 * @param {ArrayBuffer} fileDataArrayBuffer The data to be stored in the file.
 *     Null if not sent from the worker. Sent back for say Android java.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.ExportingSucceededEvent = function(
    format,
    fileName,
    url,
    fileSizeInBytes,
    fileDataArrayBuffer) {
  goog.base(this, audioCat.audio.render.EventType.EXPORTING_SUCCEEDED);
  /**
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;

  /**
   * @private {string}
   */
  this.fileName_ = fileName;

  /**
   * @private {string}
   */
  this.url_ = url;

  /**
   * @private {number}
   */
  this.fileSizeInBytes_ = fileSizeInBytes;

  /**
   * @private {ArrayBuffer}
   */
  this.fileDataArrayBuffer_ = fileDataArrayBuffer;
};
goog.inherits(
    audioCat.audio.render.ExportingSucceededEvent, audioCat.utility.Event);

/**
 * @return {audioCat.audio.render.ExportFormat} The export format.
 */
audioCat.audio.render.ExportingSucceededEvent.prototype.getFormat = function() {
  return this.format_;
};

/**
 * @return {string} The download file name.
 */
audioCat.audio.render.ExportingSucceededEvent.prototype.getFileName =
    function() {
  return this.fileName_;
};

/**
 * @return {string} The download URL.
 */
audioCat.audio.render.ExportingSucceededEvent.prototype.getUrl = function() {
  return this.url_;
};

/**
 * @return {number} The size of the file in bytes.
 */
audioCat.audio.render.ExportingSucceededEvent.prototype.getFileSizeInBytes =
    function() {
  return this.fileSizeInBytes_;
};

/**
 * @return {ArrayBuffer} The data to be stored in the file. Null if not
 *     provided.
 */
audioCat.audio.render.ExportingSucceededEvent.prototype.getFileArrayBuffer =
    function() {
  return this.fileDataArrayBuffer_;
};
