goog.provide('audioCat.action.zoom.ZoomToDefaultAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.ui.visualization.NumberConstant');


/**
 * Zooms to the default level.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the zoom level representation.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.zoom.ZoomToDefaultAction = function(
    timeDomainScaleManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(audioCat.action.zoom.ZoomToDefaultAction, audioCat.action.Action);

/** @override */
audioCat.action.zoom.ZoomToDefaultAction.prototype.doAction = function() {
  var defaultZoomLevel =
      audioCat.ui.visualization.NumberConstant.DEFAULT_ZOOM_LEVEL;
  if (this.timeDomainScaleManager_.getZoomLevel() == defaultZoomLevel) {
    this.messageManager_.issueMessage(
        'The current zoom level is already the default of ' +
            defaultZoomLevel + '.');
  } else {
    this.timeDomainScaleManager_.zoomToIndex(defaultZoomLevel);
    this.messageManager_.issueMessage(
        'Zoom level set to the default of ' + defaultZoomLevel + '.');
  }
};
