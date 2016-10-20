goog.provide('audioCat.action.play.PlayPauseAction');

goog.require('audioCat.action.Action');


/**
 * Alternates between playing and pausing.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.play.PlayPauseAction = function(playManager) {
  goog.base(this);
  /**
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;
};
goog.inherits(audioCat.action.play.PlayPauseAction, audioCat.action.Action);

/** @override */
audioCat.action.play.PlayPauseAction.prototype.doAction = function() {
  if (this.playManager_.getPlayState()) {
    // We're currently playing. Pause.
    this.playManager_.pause();
  } else {
    // We're currently not playing. Play.
    this.playManager_.play();
  }
};
