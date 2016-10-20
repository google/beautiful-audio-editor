goog.provide('audioCat.action.track.ToggleSignatureTimeGridAction');

goog.require('audioCat.action.Action');


/**
 * Toggles whether to make the grid based on time signature or time units.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the time-domain scale as well as whether
 *     to display with bars or time units.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.track.ToggleSignatureTimeGridAction = function(
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
goog.inherits(audioCat.action.track.ToggleSignatureTimeGridAction,
    audioCat.action.Action);

/** @override */
audioCat.action.track.ToggleSignatureTimeGridAction.prototype.doAction =
    function() {
  var timeDomainScaleManager = this.timeDomainScaleManager_;
  var newDisplayUsingBarsState =
      !timeDomainScaleManager.getDisplayAudioUsingBars();
  timeDomainScaleManager.setDisplayAudioUsingBars(newDisplayUsingBarsState);

  this.messageManager_.issueMessage(newDisplayUsingBarsState ?
      'The grid is now based on time signature.' :
      'The grid is now based on time units.');
};
