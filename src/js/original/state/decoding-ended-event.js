goog.provide('audioCat.state.DecodingEndedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event fired when decoding ends, either successfully or abortively.
 * @param {string=} errorMesssage The error that thwarted decoding. Or undefined
 *     if no errors occurred. Defaults to the empty string, indicating success.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.DecodingEndedEvent = function(errorMesssage) {
  goog.base(this, audioCat.state.events.DECODING_ENDED);

  /**
   * The error that made decoding fail if any. Or empty string if success.
   * @private {string}
   */
  this.errorMesssage_ = errorMesssage || '';
};
goog.inherits(audioCat.state.DecodingEndedEvent, audioCat.utility.Event);

/**
 * @return {string} The error that occurred while decoding. Or the empty string
 *     if no error occurred, and decoding was successful.
 */
audioCat.state.DecodingEndedEvent.prototype.getError = function() {
  return this.errorMesssage_;
};
