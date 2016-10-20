goog.provide('audioCat.state.EncodingDoneEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event fired when encoding the state of the project is done.
 * @param {!Blob} encoding The encoding of the project.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.EncodingDoneEvent = function(encoding) {
  goog.base(this, audioCat.state.events.ENCODING_DONE);
  /**
   * @private {!Blob}
   */
  this.encoding_ = encoding;
};
goog.inherits(audioCat.state.EncodingDoneEvent, audioCat.utility.Event);

/**
 * @return {!Blob} The encoded state of the project.
 */
audioCat.state.EncodingDoneEvent.prototype.getEncoding = function() {
  return this.encoding_;
};
