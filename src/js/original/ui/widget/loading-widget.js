goog.provide('audioCat.ui.widget.LoadingWidget');

goog.require('audioCat.ui.widget.Widget');


/**
 * A widget that communicates loading progress to the user.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {number=} opt_initialProgress The initial progress. Defaults to 0.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.LoadingWidget = function(domHelper, opt_initialProgress) {
  var outerContainer = domHelper.createDiv(
      goog.getCssName('loadingWidgetOuterContainer'));

  /**
   * Changes in size to reflect progress.
   * @private {!Element}
   */
  this.innerContainer_ = domHelper.createDiv(
      goog.getCssName('loadingWidgetInnerContainer'));
  domHelper.appendChild(outerContainer, this.innerContainer_);

  goog.base(this, outerContainer);

  // Set initial progress.
  this.setProgress(opt_initialProgress || 0);
};
goog.inherits(audioCat.ui.widget.LoadingWidget, audioCat.ui.widget.Widget);

/**
 * Sets the length of the inner container based on percent progress.
 * @param {number} progress A number within [0, 1] indicating progress made.
 */
audioCat.ui.widget.LoadingWidget.prototype.setProgress = function(progress) {
  this.innerContainer_.style.width = '' + Math.round(progress * 100) + '%';
};
