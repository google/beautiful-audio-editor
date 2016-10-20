goog.provide('audioCat.ui.toolbar.item.DownloadMp3Item');

goog.require('audioCat.audio.render.ExportFormat');
goog.require('audioCat.state.prefs.Event');
goog.require('audioCat.ui.toolbar.item.DownloadExportItem');


/**
 * A toolbar item for downloading the project as a WAVE file.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.DownloadExportItem}
 */
audioCat.ui.toolbar.item.DownloadMp3Item = function(
    domHelper,
    editModeManager,
    exportManager,
    actionManager,
    prefManager,
    toolTip) {
  goog.base(
      this,
      audioCat.audio.render.ExportFormat.MP3,
      'downloadMp3.svg',
      domHelper,
      editModeManager,
      exportManager,
      actionManager,
      toolTip);
  // Only enable if mp3 exporting is available.
  this.setOnValue(prefManager.getMp3ExportingEnabled());

  prefManager.listen(
      audioCat.state.prefs.Event.MP3_EXPORT_ENABLED_CHANGED,
      function() {
        this.setOnValue(prefManager.getMp3ExportingEnabled());
      }, false, this);
};
goog.inherits(audioCat.ui.toolbar.item.DownloadMp3Item,
    audioCat.ui.toolbar.item.DownloadExportItem);
