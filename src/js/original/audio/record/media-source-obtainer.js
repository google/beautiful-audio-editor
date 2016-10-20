goog.provide('audioCat.audio.record.MediaSourceObtainer');

goog.require('audioCat.audio.record.Event');
goog.require('audioCat.audio.record.ExceptionType');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Obtains a media stream for use in say recording. Throws an exception during
 * construction if media streaming (ie, getUserMedia) is not available.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.record.MediaSourceObtainer = function(
    idGenerator,
    supportDetector) {
  goog.base(this);

  /**
   * @private {!audioCat.utility.support.SupportDetector}
   */
  this.supportDetector_ = supportDetector;

  /**
   * The default media audio stream. null if not obtained.
   * @private {MediaStream}
   */
  this.defaultMediaAudioStream_ = null;

  // If recording is supported, we should have a getUserMedia method.
  // For implications, not p or q is the same thing as if p, then q.
  goog.asserts.assert(
      !supportDetector.getRecordingSupported() || navigator.getUserMedia);
};
goog.inherits(
    audioCat.audio.record.MediaSourceObtainer, audioCat.utility.EventTarget);

/**
 * @return {MediaStream} The media stream. null if not obtained.
 */
audioCat.audio.record.MediaSourceObtainer.prototype.getDefaultAudioStream =
    function() {
  return this.defaultMediaAudioStream_;
};

/**
 * Obtains the default audio source. Fires an event when it dones so.
 */
audioCat.audio.record.MediaSourceObtainer.prototype.obtainDefaultAudioStream =
    function() {
  if (this.supportDetector_.getRecordingSupported()) {
    // Only obtain a media stream if the browser supports recording.
    var self = this;
    navigator.getUserMedia({
        'audio': true
      },
      goog.bind(this.handleDefaultAudioStream_, self),
      goog.bind(this.handleStreamObtainingError_, self));
  }
};

/**
 * Handles what happens when we obtain the default audio stream.
 * @param {!MediaStream} mediaStream The media stream.
 * @private
 */
audioCat.audio.record.MediaSourceObtainer.prototype.handleDefaultAudioStream_ =
    function(mediaStream) {
  this.defaultMediaAudioStream_ = mediaStream;
  // At this point, the default audio media stream is defined for sure.
  this.dispatchEvent(audioCat.audio.record.Event.DEFAULT_AUDIO_STREAM_OBTAINED);
};

/**
 * Handles what happens there is an error while obtaining the audio stream.
 * @private
 */
audioCat.audio.record.MediaSourceObtainer.prototype.
    handleStreamObtainingError_ = function() {
  this.dispatchEvent(audioCat.audio.record.Event.AUDIO_STREAM_FAILED_TO_OBTAIN);
};
