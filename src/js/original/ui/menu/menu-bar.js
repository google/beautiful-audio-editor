/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audioCat.ui.menu.MenuBar');

goog.require('audioCat.service.EventType');
goog.require('audioCat.state.events');
goog.require('audioCat.state.prefs.Event');
goog.require('audioCat.ui.menu.button.EditButton');
goog.require('audioCat.ui.menu.button.FileButton');
goog.require('audioCat.ui.menu.button.HelpButton');
goog.require('audioCat.ui.menu.button.MemoryUsageButton');
goog.require('audioCat.ui.menu.button.HelpButton');
goog.require('goog.ui.menuBar');


/**
 * The main menu bar for the application.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!Element} container The container in which to render the menu bar.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Executes and
 *     manages commands.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     project sound.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages the
 *     exporting of audio.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.state.LicenseManager} licenseManager Manages licensing.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @param {!audioCat.action.RequestAudioImportAction} requestImportAudioAction
 *     An action for requesting audio import.
 * @constructor
 */
audioCat.ui.menu.MenuBar = function(
    idGenerator,
    project,
    trackManager,
    container,
    domHelper,
    commandManager,
    memoryManager,
    dialogManager,
    playManager,
    audioContextManager,
    actionManager,
    exportManager,
    statePlanManager,
    serviceManager,
    licenseManager,
    prefManager,
    requestImportAudioAction) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  /**
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  /**
   * @private {!audioCat.state.LicenseManager}
   */
  this.licenseManager_ = licenseManager;

  /**
   * @private {!audioCat.state.prefs.PrefManager}
   */
  this.prefManager_ = prefManager;

  var menuBar = /** @type {!goog.ui.Container} */ (goog.ui.menuBar.create());

  /**
   * The menu bar internal representation provided by Google Closure.
   * @private {!goog.ui.Container}
   */
  this.menuBar_ = menuBar;

  /**
   * The button for registering a license. Non-null iff it is displayed.
   * @private {audioCat.ui.menu.button.RegisterLicenseButton}
   */
  this.registerLicenseButton_ = null;

  this.addButton(new audioCat.ui.menu.button.FileButton(
      idGenerator, project, trackManager, domHelper, commandManager,
      dialogManager, audioContextManager, actionManager, exportManager,
      statePlanManager, serviceManager, requestImportAudioAction));
  this.addButton(new audioCat.ui.menu.button.EditButton(
      project, trackManager, domHelper, commandManager, audioContextManager));
  this.addButton(new audioCat.ui.menu.button.HelpButton(
      domHelper, actionManager));
  this.addButton(new audioCat.ui.menu.button.MemoryUsageButton(
      domHelper,
      actionManager,
      memoryManager,
      dialogManager,
      playManager,
      commandManager));

  menuBar.render(container);
};

/**
 * Adds a top-level button to the menu bar.
 * @param {!audioCat.ui.menu.button.MenuButton} button The menu button to add.
 */
audioCat.ui.menu.MenuBar.prototype.addButton = function(button) {
  this.menuBar_.addChild(button, true);
};

/**
 * Removes a top-level button from the menu bar.
 * @param {!audioCat.ui.menu.button.MenuButton} button The button to remove.
 */
audioCat.ui.menu.MenuBar.prototype.removeButton = function(button) {
  this.menuBar_.removeChild(button, true);
};
