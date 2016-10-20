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
