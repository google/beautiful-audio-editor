goog.provide('audioCat.ui.toolbar.RenderToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.DownloadMp3Item');
goog.require('audioCat.ui.toolbar.item.DownloadWavItem');
goog.require('audioCat.ui.toolbar.item.RenderToTrackItem');


/**
 * A toolbar with items for rendering and downloading audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout this single-threaded application.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.RenderToolbar = function(
    actionManager,
    exportManager,
    audioRenderer,
    idGenerator,
    commandManager,
    prefManager,
    domHelper,
    editModeManager,
    toolTip) {
  goog.base(this, domHelper, editModeManager, [
      new audioCat.ui.toolbar.item.DownloadWavItem(
          domHelper,
          editModeManager,
          exportManager,
          actionManager,
          toolTip),
      new audioCat.ui.toolbar.item.DownloadMp3Item(
          domHelper,
          editModeManager,
          exportManager,
          actionManager,
          prefManager,
          toolTip),
      new audioCat.ui.toolbar.item.RenderToTrackItem(
          domHelper,
          editModeManager,
          actionManager,
          audioRenderer,
          toolTip)
    ]);
};
goog.inherits(audioCat.ui.toolbar.RenderToolbar, audioCat.ui.toolbar.Toolbar);
