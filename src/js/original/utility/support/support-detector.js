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
goog.provide('audioCat.utility.support.SupportDetector');

goog.require('audioCat.utility.support.AudioFormat');
goog.require('goog.array');
goog.require('goog.userAgent.product');


/**
 * Detects support for various features and formats.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 */
audioCat.utility.support.SupportDetector = function(domHelper) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  var browserEnum = goog.userAgent.product;
  /**
   * Whether the current browser is supported.
   * @private {boolean}
   */
  this.browserSupported_ = browserEnum.CHROME ||
      browserEnum.FIREFOX;

  /**
   * A list of likely supported audio formats. The web audio API is vague and
   * does not specify for sure.
   * @private {!Array.<!audioCat.utility.support.AudioFormat>}
   */
  this.supportedAudioFormats_ = [];

  /**
   * A list of unsupported formats.
   * @private {!Array.<!audioCat.utility.support.AudioFormat>}
   */
  this.unsupportedAudioFormats_ = [];

  // Populates the lists of supported and unsupported formats.
  this.populateAudioFormats_();

  // Detect support for the web audio API.
  goog.global.AudioContext =
      goog.global.AudioContext || goog.global.webkitAudioContext;

  /**
   * Whether the web audio API is supported.
   * @private {boolean}
   */
  this.webAudioApiSupported_ = !!goog.global.AudioContext;

  // Detect support for recording through getUserMedia.
  navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

  /**
   * Whether getUserMedia is supported.
   * @private {boolean}
   */
  this.getUserMediaSupported_ = !!navigator.getUserMedia;

  /**
   * Whether media stream source nodes are supported.
   * @private {boolean}
   */
  this.mediaStreamSourceNodeSupported_ =
      !!goog.global.AudioContext.prototype.createMediaStreamSource;

  /**
   * Whether the download attribute for links is supported.
   * @private {boolean}
   */
  this.downloadAttributeSupported_ = 'download' in domHelper.createElement('a');

  // Specify the global object URL as the official dynamic URL object.
  goog.global.URL = goog.global.URL || goog.global.webkitURL;
};

/**
 * @return {boolean} Whether the current browser is supported.
 */
audioCat.utility.support.SupportDetector.prototype.getBrowserSupported =
    function() {
  return this.browserSupported_;
};

/**
 * @return {boolean} Whether the web audio API is supported.
 */
audioCat.utility.support.SupportDetector.prototype.getWebAudioApiSupported =
    function() {
  return this.webAudioApiSupported_;
};

/**
 * @return {boolean} Whether getting user media is supported.
 */
audioCat.utility.support.SupportDetector.prototype.getUserMediaSupported =
    function() {
  return this.getUserMediaSupported_;
};

/**
 * @return {boolean} Whether the media stream source node is supported.
 */
audioCat.utility.support.SupportDetector.prototype.
    getMediaStreamSourceNodeSupported = function() {
  return this.mediaStreamSourceNodeSupported_;
};

/**
 * @return {boolean} Whether recording is supported.
 */
audioCat.utility.support.SupportDetector.prototype.getRecordingSupported =
    function() {
  return this.getUserMediaSupported() &&
      this.getMediaStreamSourceNodeSupported();
};

/**
 * @return {boolean} Whether the download attribute for links is supported.
 */
audioCat.utility.support.SupportDetector.prototype.
    getDownloadAttributeSupported =
    function() {
  return this.downloadAttributeSupported_;
};

/**
 * Obtains a list of either supported or unsupported audio formats.
 * @param {boolean} supported If true, returns supported formats. Otherwise,
 *     returns unsupported formats.
 * @return {!Array.<!audioCat.utility.support.AudioFormat>} The list of either
 *     supported or unsupported formats.
 */
audioCat.utility.support.SupportDetector.prototype.getListOfFormats =
    function(supported) {
  return supported ?
      this.supportedAudioFormats_ : this.unsupportedAudioFormats_;
};

/**
 * Obtains a list of either supported or unsupported audio file extensions.
 * @param {boolean} supported If true, returns supported formats. Otherwise,
 *     returns unsupported formats.
 * @return {string} A string that lists either supported or unsupported file
 *     extensions.
 */
audioCat.utility.support.SupportDetector.prototype.obtainJoinedFileExtensions =
    function(supported) {
  var formats = this.getListOfFormats(supported);
  var extensions = goog.array.map(formats, function(audioFormat) {
    return audioFormat.getExtensions().join(', ');
  });
  return extensions.join(', ');
};

/**
 * Populates the lists of audio formats.
 * @private
 */
audioCat.utility.support.SupportDetector.prototype.populateAudioFormats_ =
    function() {
  var audioTag = this.domHelper_.createElement('audio');
  if (!audioTag.canPlayType) {
    // The audio tag is not even supported.
    return;
  }
  var allAudioFormats = [
      new audioCat.utility.support.AudioFormat('audio/aac',
          ['aac']),
      new audioCat.utility.support.AudioFormat('audio/aiff',
          ['aiff', 'aif', 'aic']),
      new audioCat.utility.support.AudioFormat('audio/basic',
          ['au', 'and']),
      new audioCat.utility.support.AudioFormat('audio/flac',
          ['flac']),
      new audioCat.utility.support.AudioFormat('audio/mpeg',
          ['mp1', 'mp2', 'mp3', 'mpg', 'mpeg']),
      new audioCat.utility.support.AudioFormat('audio/mp4',
          ['mp4']),
      new audioCat.utility.support.AudioFormat('audio/ogg',
          ['oga', 'ogg', 'opus', 'ogv']),
      new audioCat.utility.support.AudioFormat('audio/wav',
          ['wav', 'wave']),
      new audioCat.utility.support.AudioFormat('audio/webm',
          ['webm'])
    ];

  for (var i = 0; i < allAudioFormats.length; ++i) {
    var format = allAudioFormats[i];
    (audioTag.canPlayType(format.getMimeType()).replace(/no/, '') ?
        this.supportedAudioFormats_ : this.unsupportedAudioFormats_).
            push(format);
  }
};
