goog.provide('audioCat.audio.junction.MediaSourceJunction');

goog.require('audioCat.audio.junction.Junction');
goog.require('audioCat.audio.junction.StartJunction');
goog.require('audioCat.audio.junction.Type');

/**
 * A junction for hooking up with a media source.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!MediaStream} mediaStream The stream for the media source.
 * @constructor
 * @extends {audioCat.audio.junction.Junction}
 * @implements {audioCat.audio.junction.StartJunction}
 */
audioCat.audio.junction.MediaSourceJunction =
    function(idGenerator, audioContextManager, mediaStream) {
  goog.base(
      this,
      audioContextManager,
      idGenerator,
      audioCat.audio.junction.Type.MEDIA_SOURCE);

  /**
   * The stream for the media source.
   * @private {!MediaStream}
   */
  this.mediaStream_ = mediaStream;

  /**
   * The last media stream source node used. Stored for disconnect. null if
   * none used yet, or it had been cleared.
   * @private {MediaStreamAudioSourceNode}
   */
  this.lastMediaStreamSourceNodeUsed_ = null;
};
goog.inherits(audioCat.audio.junction.MediaSourceJunction,
    audioCat.audio.junction.Junction);

/** @override */
audioCat.audio.junction.MediaSourceJunction.prototype.cleanUp = function() {
  if (this.cleanedUp) {
    return;
  }
  // TODO(chizeng): Later, remove all listeners this node might assign.
  this.cleanedUp = true;
};

/** @override */
audioCat.audio.junction.MediaSourceJunction.prototype.start =
    function(time, opt_offlineAudioContext) {
  // The time is irrelevant for this node since it obtains live media data.
  // TODO(chizeng): Get offline to work.
  var mediaStreamSourceNode =
      this.audioContextManager.createMediaStreamSourceNode(
          this.mediaStream_, opt_offlineAudioContext);
  this.lastMediaStreamSourceNodeUsed_ = mediaStreamSourceNode;
  mediaStreamSourceNode.connect(
      this.nextJunction.obtainRawNode(opt_offlineAudioContext));
};

/** @override */
audioCat.audio.junction.MediaSourceJunction.prototype.stop = function() {
  var lastNodeUsed = this.lastMediaStreamSourceNodeUsed_;
  if (lastNodeUsed) {
    lastNodeUsed.disconnect();
  }
};

/** @override */
audioCat.audio.junction.MediaSourceJunction.prototype.connect =
    function(junction) {
  // The call to this function defines this.nextJunction for us.
  junction.addPreviousJunction(this);
};
