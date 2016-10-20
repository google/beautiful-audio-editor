goog.provide('audioCat.ui.tracks.widget.CreateEmptyTrackWidget');

goog.require('audioCat.ui.tracks.widget.TrackLeftBottomWidget');


/**
 * A widget for creating new empty tracks.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.track.CreateEmptyTrackAction} createEmptyTrackAction
 *     An action for creating empty tracks.
 * @constructor
 * @extends {audioCat.ui.tracks.widget.TrackLeftBottomWidget}
 */
audioCat.ui.tracks.widget.CreateEmptyTrackWidget = function(
    domHelper,
    createEmptyTrackAction) {
  /**
   * @private
   */
  this.createEmptyTrackAction_ = createEmptyTrackAction;

  goog.base(this, domHelper, '+ Empty', 'Add empty track.');
};
goog.inherits(audioCat.ui.tracks.widget.CreateEmptyTrackWidget,
    audioCat.ui.tracks.widget.TrackLeftBottomWidget);

/** @override */
audioCat.ui.tracks.widget.CreateEmptyTrackWidget.prototype.handleUpPress =
    function() {
  this.createEmptyTrackAction_.doAction();
};
