goog.provide('audioCat.audio.junction.DestinationJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.SubsequentJunction');
goog.require('audioCat.audio.junction.Type');


/**
 * A junction that marks the output for audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.SubsequentJunction}
 */
audioCat.audio.junction.DestinationJunction =
    function(idGenerator, audioContextManager) {
  /**
   * The destination node for play.
   * @private {!AudioDestinationNode}
   */
  this.audioDestinationNode_ = audioContextManager.createAudioDestinationNode();

  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.DESTINATION);
};
goog.inherits(audioCat.audio.junction.DestinationJunction,
    audioCat.audio.junction.Junction);

/** @inheritDoc */
audioCat.audio.junction.DestinationJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {
  if (opt_offlineAudioContext) {
    return this.audioContextManager.createAudioDestinationNode(
        opt_offlineAudioContext);
  }
  return this.audioDestinationNode_;
};

/** @inheritDoc */
audioCat.audio.junction.DestinationJunction.prototype.connect =
    function(junction) {
  // The destination junction should not be able to connect anything.
  return;
};
