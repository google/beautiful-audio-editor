goog.provide('audioCat.state.Clip');


/**
 * A clip is a piece of audio defined by a begin and end sample of a larger
 * piece of audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {number} beginSample An integer. The index of the begin sample.
 * @param {number} endSampleBound An integer. The non-inclusive index of the end
 *     sample.
 * @param {audioCat.utility.Id=} opt_overridingId An ID to assign this Audio
 *     Chest. If provided, the audio chest will use this ID instead of creating
 *     a new one.
 * @constructor
 */
audioCat.state.Clip = function(
    idGenerator, beginSample, endSampleBound, opt_overridingId) {
  /**
   * An ID unique to this entity throughout the application.
   * @private {number}
   */
  this.id_ = opt_overridingId || idGenerator.obtainUniqueId();

  /**
   * The index of the begin sample.
   * @private {number}
   */
  this.beginSample_ = beginSample;

  /**
   * The non-inclusive index of the end sample (the right bound).
   * @private {number}
   */
  this.endSampleBound_ = endSampleBound;
};

/**
 * @return {audioCat.utility.Id} An ID unique to this clip.
 */
audioCat.state.Clip.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {number} The sample at which the clip begins.
 */
audioCat.state.Clip.prototype.getBeginSampleIndex = function() {
  return this.beginSample_;
};

/**
 * @return {number} The index of the non-inclusive sample at which the clip
 *     ends.
 */
audioCat.state.Clip.prototype.getRightSampleBound = function() {
  return this.endSampleBound_;
};
