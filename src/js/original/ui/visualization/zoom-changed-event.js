goog.provide('audioCat.ui.visualization.ZoomChangedEvent');

goog.require('audioCat.ui.visualization.events');
goog.require('audioCat.utility.Event');


/**
 * Event dispatched when the current zoom changes.
 * @param {number} previousZoomIndex The previous zoom index.
 * @param {number} zoomIndex The updated zoom index.
 * @param {!audioCat.ui.visualization.TimeDomainScale} timeDomainScale The
 *     current scale to use for rendering audio time domain representations.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.visualization.ZoomChangedEvent =
    function(previousZoomIndex, zoomIndex, timeDomainScale) {
  goog.base(this, audioCat.ui.visualization.events.ZOOM_CHANGED);

  /**
   * The previous zoom index.
   * @private {number}
   */
  this.previousZoomIndex_ = previousZoomIndex;

  /**
   * The updated zoom index.
   * @private {number}
   */
  this.zoomIndex_ = zoomIndex;

  /**
   * The updated time domain scale to render audio with.
   * @private {!audioCat.ui.visualization.TimeDomainScale}
   */
  this.timeDomainScale_ = timeDomainScale;
};
goog.inherits(
    audioCat.ui.visualization.ZoomChangedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.ui.visualization.TimeDomainScale} The updated time domain
 *     scale to render audio with.
 */
audioCat.ui.visualization.ZoomChangedEvent.prototype.getTimeDomainScale =
    function() {
  return this.timeDomainScale_;
};
