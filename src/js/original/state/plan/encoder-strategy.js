goog.provide('audioCat.state.plan.EncoderStrategy');

goog.require('audioCat.utility.EventTarget');


/**
 * A strategy for encoding the project state.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.plan.EncoderStrategy = function() {
  goog.base(this);
};
goog.inherits(
    audioCat.state.plan.EncoderStrategy, audioCat.utility.EventTarget);

/**
 * Takes an encoding and makes the current work space take on its state,
 * overriding any existing content.
 * @param {!ArrayBuffer} encoding The encoding to actuate.
 */
audioCat.state.plan.EncoderStrategy.prototype.decode = goog.abstractMethod;

/**
 * Produces an encoding of the project that can be later used to load it.
 * @return {!Blob}
 */
audioCat.state.plan.EncoderStrategy.prototype.produceEncoding =
    goog.abstractMethod;
