goog.provide('audioCat.ui.tracks.widget.ImportAudioWidget');

goog.require('audioCat.ui.tracks.widget.TrackLeftBottomWidget');


/**
 * A widget for importing audio.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.RequestAudioImportAction} requestAudioImportAction
 *     An action that requests an import of audio.
 * @constructor
 * @extends {audioCat.ui.tracks.widget.TrackLeftBottomWidget}
 */
audioCat.ui.tracks.widget.ImportAudioWidget = function(
    domHelper,
    requestAudioImportAction) {
  /**
   * @private {!audioCat.action.RequestAudioImportAction}
   */
  this.requestAudioImportAction_ = requestAudioImportAction;

  goog.base(this, domHelper, '+ Import', 'Import audio file.');
};
goog.inherits(audioCat.ui.tracks.widget.ImportAudioWidget,
    audioCat.ui.tracks.widget.TrackLeftBottomWidget);

/** @override */
audioCat.ui.tracks.widget.ImportAudioWidget.prototype.handleUpPress =
    function() {
  this.requestAudioImportAction_.doAction();
};
