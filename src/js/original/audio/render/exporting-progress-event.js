goog.provide('audioCat.audio.render.ExportingProgressEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');
goog.require('goog.asserts');


/**
 * An event fired when exporting a certain format progresses
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {number} progress The fraction out of 1 denoting how much progress has
 *     been made.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.ExportingProgressEvent = function(format, progress) {
  goog.base(this, audioCat.audio.render.EventType.EXPORTING_PROGRESS);

  /**
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;

  /**
   * @private {number}
   */
  this.progress_ = progress;
  goog.asserts.assert(progress >= 0);
  goog.asserts.assert(progress <= 1);
};
goog.inherits(audioCat.audio.render.ExportingProgressEvent,
    audioCat.utility.Event);

/**
 * @return {audioCat.audio.render.ExportFormat} The export format.
 */
audioCat.audio.render.ExportingProgressEvent.prototype.getFormat = function() {
  return this.format_;
};

/**
 * @return {number} The fraction of progress made so far.
 */
audioCat.audio.render.ExportingProgressEvent.prototype.getProgress =
    function() {
  return this.progress_;
};
