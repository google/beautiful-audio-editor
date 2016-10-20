goog.provide('audioCat.ui.menu.button.EditButton');

goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('audioCat.ui.menu.item.RedoItem');
goog.require('audioCat.ui.menu.item.UndoItem');


/**
 * Top-level edit button on the menu bar.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.EditButton = function(
    project,
    trackManager,
    domHelper,
    commandManager,
    audioContextManager) {
  /**
   * The project.
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  var menu = new audioCat.ui.menu.Menu();
  menu.addMenuItem(
      new audioCat.ui.menu.item.UndoItem(domHelper, commandManager));
  menu.addMenuItem(
      new audioCat.ui.menu.item.RedoItem(domHelper, commandManager));

  goog.base(this, 'Edit', menu);
};
goog.inherits(
    audioCat.ui.menu.button.EditButton, audioCat.ui.menu.button.MenuButton);
