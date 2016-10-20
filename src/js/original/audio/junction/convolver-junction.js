goog.provide('audioCat.audio.junction.ConvolverJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.NewImpulseResponseNeededEvent');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that performs some sort of convolution.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.ConvolverJunction = function(
    idGenerator,
    audioContextManager) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.CONVOLVER);

  /**
   * The convolver node that performs the convolution.
   * @private {!ConvolverNode}
   */
  this.convolverNode_ = audioContextManager.createConvolverNode();

  /**
   * The audio buffer representing the current impulse response to apply. Null
   * if currently none.
   * @private {AudioBuffer}
   */
  this.impulseResponse_ = null;
};
goog.inherits(audioCat.audio.junction.ConvolverJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.ConvolverJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }

  this.convolverNode_.disconnect();
  this.audioContextManager.setImpulseResponse(this.convolverNode_, null);
  this.cleanedUp = true;
};

/**
 * Sets the impulse response.
 * @param {?AudioBuffer} impulseResponse The impulse response to apply. Or null
 *     if we are unsetting the impulse response.
 */
audioCat.audio.junction.ConvolverJunction.prototype.setImpulseResponse =
    function(impulseResponse) {
  this.audioContextManager.setImpulseResponse(
      this.convolverNode_, impulseResponse);
};

/** @override */
audioCat.audio.junction.ConvolverJunction.prototype.connect =
    function(junction) {
  this.convolverNode_.connect(junction.obtainRawNode());
  junction.addPreviousJunction(this);
};

/** @override */
audioCat.audio.junction.ConvolverJunction.prototype.disconnect = function() {
  this.convolverNode_.disconnect();
  // Removes javascript stores of previous/next node links.
  this.removeNextConnection();
};

/** @override */
audioCat.audio.junction.ConvolverJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  var audioContextSampleRate =
      this.audioContextManager.getSampleRate(opt_offlineAudioContext);
  var impulseResponse =
      this.audioContextManager.getImpulseResponse(this.convolverNode_);
  if (audioContextSampleRate != impulseResponse.sampleRate) {
    // If the impulse response's sampling rate does not match, re-create the
    // impulse response. They must match to avoid an exception:
    // https://news.ycombinator.com/item?id=8803223
    this.dispatchEvent(
        new audioCat.audio.junction.NewImpulseResponseNeededEvent(
            audioContextSampleRate));
    impulseResponse =
        this.audioContextManager.getImpulseResponse(this.convolverNode_);
  }

  if (opt_offlineAudioContext) {
    var offlineNode = this.audioContextManager.createConvolverNode(
        opt_offlineAudioContext);
    this.audioContextManager.setImpulseResponse(offlineNode, impulseResponse);
    offlineNode.connect(
        this.nextJunction.obtainRawNode(opt_offlineAudioContext));
    return offlineNode;
  }
  return this.convolverNode_;
};
