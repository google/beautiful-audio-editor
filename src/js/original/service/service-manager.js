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
goog.provide('audioCat.service.ServiceManager');

goog.require('audioCat.service.EventType');
goog.require('audioCat.service.GoogleDriveService');
goog.require('audioCat.service.MainServiceChangedEvent');
goog.require('audioCat.service.ServiceId');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Manages services that the editor integrates with. Such as Google Drive.
 * @param {!audioCat.state.Project} project Encapsulates meta data for the
 *     project such as the title.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.persistence.LocalStorageManager} localStorageManager
 *     Manages reading from and writing to local storage.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues messages
 *     to the user.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes projects.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages different types of effects and their creation.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates successive
 *     unique integer IDs within a single thread.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.service.ServiceManager = function(
    project,
    domHelper,
    commandManager,
    localStorageManager,
    prefManager,
    dialogManager,
    messageManager,
    memoryManager,
    statePlanManager,
    effectModelController,
    audioContextManager,
    idGenerator) {
  goog.base(this);
  /**
   * A mapping from service ID to the integrator for that service, which
   * integrates the service with the editor.
   * @private {!Object.<audioCat.service.ServiceId, !audioCat.service.Service>}
   */
  this.serviceMapping_ = {};
  this.serviceMapping_[audioCat.service.ServiceId.GOOGLE_DRIVE] =
      new audioCat.service.GoogleDriveService(
          project,
          domHelper,
          commandManager,
          localStorageManager,
          prefManager,
          dialogManager,
          messageManager,
          memoryManager,
          statePlanManager,
          effectModelController,
          audioContextManager,
          idGenerator);

  /**
   * The current primary service being used, if any.
   * @private {audioCat.service.Service}
   */
  this.primaryService_ = null;
};
goog.inherits(audioCat.service.ServiceManager, audioCat.utility.EventTarget);

/**
 * Obtains the service with a certain ID. Assumes that it is defined.
 * @param {audioCat.service.ServiceId} serviceId
 * @return {!audioCat.service.Service} The service with that ID.
 */
audioCat.service.ServiceManager.prototype.getServiceWithId = function(
    serviceId) {
  var service = this.serviceMapping_[serviceId];
  goog.asserts.assert(service);
  return service;
};

/**
 * @return {audioCat.service.Service} The primary service. Or null if none.
 */
audioCat.service.ServiceManager.prototype.getPrimaryService = function() {
  return this.primaryService_;
};

/**
 * Sets the primary service to some service or null.
 * @param {audioCat.service.Service} service The service to set to. Or null.
 * @private
 */
audioCat.service.ServiceManager.prototype.setPrimaryService_ = function(
    service) {
  var oldService = this.primaryService_;
  this.primaryService_ = service;
  if (oldService != service) {
    this.dispatchEvent(new audioCat.service.MainServiceChangedEvent(
        oldService, service));
  }
};

/**
 * Selects any service that is relevant to the current instance of the editor,
 * and sets it as the primary one if there is at least a single relevant
 * service.
 */
audioCat.service.ServiceManager.prototype.makeAnyRelevantServiceMain =
    function() {
  goog.object.forEach(this.serviceMapping_, function(service) {
    if (service.isRelevant()) {
      this.setPrimaryService_(service);
      return;
    }
  }, this);
};
