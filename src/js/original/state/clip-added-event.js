goog.provide('audioCat.state.ClipAddedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched by a section when a clip is added.
 * @param {!audioCat.state.Clip} clip The added clip.
 * @param {number} timeBegin The duration at which the clip was added in
 *     seconds.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.ClipAddedEvent = function(clip, timeBegin) {
  goog.base(this, audioCat.state.events.CLIP_ADDED);

  /**
   * The added clip.
   * @private {!audioCat.state.Clip}
   */
  this.clip_ = clip;

  /**
   * The duration at which the clip should begin.
   * @private {number}
   */
  this.timeBegin_ = timeBegin;
};
goog.inherits(audioCat.state.ClipAddedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.Clip} The added clip.
 */
audioCat.state.ClipAddedEvent.prototype.getClip = function() {
  return this.clip_;
};

/**
 * @return {number} The start time in seconds of the clip relative to the start
 *     of the track.
 */
audioCat.state.ClipAddedEvent.prototype.getBeginTime = function() {
  return this.timeBegin_;
};
