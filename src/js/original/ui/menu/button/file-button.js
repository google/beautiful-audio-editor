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
goog.provide('audioCat.ui.menu.button.FileButton');

goog.require('audioCat.service.EventType');
goog.require('audioCat.service.ServiceId');
goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('audioCat.ui.menu.item.DriveAudioImportItem');
goog.require('audioCat.ui.menu.item.EncodeProjectItem');
goog.require('audioCat.ui.menu.item.ExportAsWavItem');
goog.require('audioCat.ui.menu.item.ImportAudioItem');
goog.require('audioCat.ui.menu.item.LoadLocalProjectItem');
goog.require('audioCat.ui.menu.item.SaveToGoogleDriveItem');
goog.require('goog.asserts');


/**
 * Top-level file button on the menu bar.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages the
 *     exporting of audio.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.action.RequestAudioImportAction} requestImportAudioAction
 *     An action for requesting audio import.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.FileButton = function(
    idGenerator,
    project,
    trackManager,
    domHelper,
    commandManager,
    dialogManager,
    audioContextManager,
    actionManager,
    exportManager,
    statePlanManager,
    serviceManager,
    requestImportAudioAction) {
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

  // Populate the menu with items.
  var menu = new audioCat.ui.menu.Menu();

  var currentService;
  var servicesButton;
  var serviceSeparator;

  // The menu item for importing audio from Drive.
  var driveAudioImportItemTurnedOn = true;
  var driveAudioImportItem;

  // Removes the servives section if it exists. Otherwise, does nothing.
  var removeServicesSection = function() {
    if (serviceSeparator) {
      goog.asserts.assertInstanceof(
          servicesButton, audioCat.ui.menu.item.SaveToGoogleDriveItem);
      goog.asserts.assertInstanceof(serviceSeparator, goog.ui.MenuSeparator);
      menu.removeChild(servicesButton);
      servicesButton.dispose();
      servicesButton = undefined;
      menu.removeChild(serviceSeparator);
      serviceSeparator.dispose();
      serviceSeparator = undefined;
    }
  };

  // Initialize new document (preps saving for that doc) assuming previous one
  // is torn down. Also assumes that a service exists.
  var initializeNewDocument = function(documentId) {
    goog.asserts.assert(currentService);
    servicesButton = new audioCat.ui.menu.item.SaveToGoogleDriveItem(
        domHelper,
        actionManager,
        currentService);
    menu.addChildAt(servicesButton, 0, true);
    serviceSeparator = menu.createSeparator();
    menu.addChildAt(serviceSeparator, 1, true);
  };

  var handleChangeInDocument = function() {
    removeServicesSection();
    var newDocumentId = currentService.getOpenDocumentDescriptor();
    if (newDocumentId.length) {
      initializeNewDocument(newDocumentId);
    }
  };

  // Initializes new service assuming previous one is torn down.
  var initializeNewService = function(newService) {
    currentService = newService;
    if (currentService) {
      var documentId = newService.getOpenDocumentDescriptor();
      if (documentId.length) {
        initializeNewDocument(documentId);
      }
      currentService.listen(audioCat.service.EventType.OPEN_DOCUMENT_CHANGED,
          handleChangeInDocument, false, this);
      // If we are using Drive, create an item for importing audio from Drive.
      if (driveAudioImportItemTurnedOn && newService.getServiceId() ==
          audioCat.service.ServiceId.GOOGLE_DRIVE) {
        driveAudioImportItem = 
            new audioCat.ui.menu.item.DriveAudioImportItem(
                idGenerator, commandManager, audioContextManager, domHelper,
                dialogManager,
                actionManager,
                /** @type {!audioCat.service.GoogleDriveService} */ (
                    newService));
        menu.addMenuItem(driveAudioImportItem);
      }
    }
  };

  var tearDownOldService = function(service) {
    removeServicesSection();
    service.unlisten(audioCat.service.EventType.OPEN_DOCUMENT_CHANGED,
        handleChangeInDocument, false, this);
    currentService = undefined;
    // Remove the import from Drive menu item if it exists.
    if (driveAudioImportItem) {
      menu.removeMenuItem(
          /** @type {!audioCat.ui.menu.item.DriveAudioImportItem} */ (
              driveAudioImportItem));
      driveAudioImportItem.dispose();
      driveAudioImportItem = null;
    }
  };

  /** @param {!audioCat.service.MainServiceChangedEvent} event */
  var handleMainServiceChange = function(event) {
    if (event.oldService) {
      tearDownOldService(event.oldService);
    }
    initializeNewService(event.newService);
  };

  var newService = serviceManager.getPrimaryService();
  if (newService) {
    // A primary service exists. Initialize it.
    initializeNewService(newService);
  }
  serviceManager.listen(audioCat.service.EventType.MAIN_SERVICE_CHANGED,
      handleMainServiceChange, false, this);

  menu.addMenuItem(
      new audioCat.ui.menu.item.ImportAudioItem(requestImportAudioAction));
  menu.addMenuItem(
      new audioCat.ui.menu.item.ExportAsWavItem(actionManager, exportManager));
  menu.addSeparator();

  // Populate the items related to saving local projects.
  menu.addMenuItem(new audioCat.ui.menu.item.EncodeProjectItem(
      domHelper, actionManager, statePlanManager));
  menu.addMenuItem(new audioCat.ui.menu.item.LoadLocalProjectItem(
      domHelper, actionManager, statePlanManager));

  goog.base(this, 'File', menu);
};
goog.inherits(
    audioCat.ui.menu.button.FileButton, audioCat.ui.menu.button.MenuButton);
