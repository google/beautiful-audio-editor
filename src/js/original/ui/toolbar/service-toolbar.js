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
goog.provide('audioCat.ui.toolbar.ServiceToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.SaveToServiceItem');


/**
 * A toolbar with items for playing, pausing, and reseting audio.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages integration
 *     with other services.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!Function} headerOffsetFunction The method called to set the height
 *     of the header. This function is needed since an empty toolbar differs in
 *     height from a toolbar with items.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.ServiceToolbar = function(
    serviceManager,
    domHelper,
    editModeManager,
    actionManager,
    headerOffsetFunction,
    toolTip) {
  goog.base(this, domHelper, editModeManager, []);

  var saveToServiceItem;

  // Removes the servives section if it exists. Otherwise, does nothing.
  var self = this;
  var removeServicesSection = function() {
    if (saveToServiceItem) {
      goog.asserts.assertInstanceof(
          saveToServiceItem, audioCat.ui.toolbar.item.SaveToServiceItem);
      self.removeItem(saveToServiceItem);
      saveToServiceItem.dispose();
      saveToServiceItem = undefined;
    }
    headerOffsetFunction();
  };

  // Initialize new document (preps saving for that doc) assuming previous one
  // is torn down. Also assumes that a service exists.
  var initializeNewDocument = function(documentId) {
    var primaryService = serviceManager.getPrimaryService();
    goog.asserts.assert(primaryService);
    saveToServiceItem = new audioCat.ui.toolbar.item.SaveToServiceItem(
        domHelper,
        primaryService,
        editModeManager,
        actionManager,
        toolTip
      );
    self.addItem(saveToServiceItem, 0);
    headerOffsetFunction();
  };

  var handleChangeInDocument = function() {
    removeServicesSection();
    var newDocumentId =
        serviceManager.getPrimaryService().getOpenDocumentDescriptor();
    if (newDocumentId.length) {
      initializeNewDocument(newDocumentId);
    }
  };

  // Initializes new service assuming previous one is torn down.
  var initializeNewService = function(newService) {
    if (newService) {
      var documentId = newService.getOpenDocumentDescriptor();
      if (documentId.length) {
        initializeNewDocument(documentId);
      }
      newService.listen(audioCat.service.EventType.OPEN_DOCUMENT_CHANGED,
          handleChangeInDocument, false, this);
    }
  };

  var tearDownOldService = function(service) {
    removeServicesSection();
    service.unlisten(audioCat.service.EventType.OPEN_DOCUMENT_CHANGED,
        handleChangeInDocument, false, this);
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
};
goog.inherits(audioCat.ui.toolbar.ServiceToolbar, audioCat.ui.toolbar.Toolbar);
