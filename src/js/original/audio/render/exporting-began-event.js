goog.provide('audioCat.audio.render.ExportingBeganEvent');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event fired when exporting a certain format begins.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.audio.render.ExportingBeganEvent = function(format) {
  goog.base(this, audioCat.audio.render.EventType.EXPORTING_BEGAN);

  /**
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;
};
goog.inherits(audioCat.audio.render.ExportingBeganEvent,
    audioCat.utility.Event);

/**
 * @return {audioCat.audio.render.ExportFormat} The export format.
 */
audioCat.audio.render.ExportingBeganEvent.prototype.getFormat = function() {
  return this.format_;
};
