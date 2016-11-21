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
goog.provide('audioCat.service.Service');

goog.require('audioCat.utility.EventTarget');


/**
 * A service that the editor integrates with such as Google Drive.
 * @param {!audioCat.state.Project} project Encapsulates meta data for the
 *     project such as the title.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
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
 * @param {audioCat.service.ServiceId} serviceId The ID of this service.
 * @param {string} serviceName The name of the service.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.service.Service = function(
    project,
    domHelper,
    commandManager,
    dialogManager,
    messageManager,
    memoryManager,
    statePlanManager,
    effectModelController,
    audioContextManager,
    idGenerator,
    serviceId,
    serviceName) {
  goog.base(this);
  /**
   * @protected {!audioCat.state.Project}
   */
  this.project = project;

  /**
   * @protected {!audioCat.utility.DomHelper}
   */
  this.domHelper = domHelper;

  /**
   * @protected {!audioCat.state.command.CommandManager}
   */
  this.commandManager = commandManager;

  /**
   * @protected {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager = dialogManager;

  /**
   * @protected {!audioCat.ui.message.MessageManager}
   */
  this.messageManager = messageManager;

  /**
   * @protected {!audioCat.state.MemoryManager}
   */
  this.memoryManager = memoryManager;

  /**
   * @protected {!audioCat.state.StatePlanManager}
   */
  this.statePlanManager = statePlanManager;

  /**
   * @protected {!audioCat.state.effect.EffectModelController}
   */
  this.effectModelController = effectModelController;

  /**
   * @protected {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager = audioContextManager;

  /**
   * @protected {!audioCat.utility.IdGenerator}
   */
  this.idGenerator = idGenerator;

  /**
   * @private {audioCat.service.ServiceId}
   */
  this.serviceId_ = serviceId;

  /**
   * The name of the service.
   * @private {string}
   */
  this.serviceName_ = serviceName;
};
goog.inherits(audioCat.service.Service, audioCat.utility.EventTarget);

/**
 * @return {string} The name of the service.
 */
audioCat.service.Service.prototype.getServiceName = function() {
  return this.serviceName_;
};

/**
 * @return {audioCat.service.ServiceId} The ID of the service.
 */
audioCat.service.Service.prototype.getServiceId = function() {
  return this.serviceId_;
};

/**
 * Determines whether this service is relevant for this instance of the editor.
 * @return {boolean} Whether this service is relevant to load now.
 */
audioCat.service.Service.prototype.isRelevant = goog.abstractMethod;

/**
 * Takes the appropriate action assuming that the app is relevant.
 * @param {!audioCat.action.ActionManager} actionManager Manages all actions.
 */
audioCat.service.Service.prototype.takeAppropriateAction = goog.abstractMethod;

/**
 * Makes an attempt to authorize the user.
 * @param {!Function=} opt_successCallback Defaults to the null function.
 * @param {!Function=} opt_failureCallback Defaults to the null Function.
 */
audioCat.service.Service.prototype.tryToAuthorize = goog.abstractMethod;

/**
 * Prompts the user to install the app. Assumes that the user has been
 * authorized.
 * @param {!Function=} opt_acceptCallback Called when the user accepts the
 *     installation. Defaults to the null function.
 * @param {!Function=} opt_refuseCallback Called when the user refuses the
 *     installation. Defaults to the null Function.
 */
audioCat.service.Service.prototype.tryToInstall = goog.abstractMethod;

/**
 * @return {string} The name of the image for save icon for this service.
 */
audioCat.service.Service.prototype.getSaveIconImage = goog.abstractMethod;

/**
 * @return {boolean} Whether or not a save would have an effect, ie did the user
 *     make any meaningful changes.
 */
audioCat.service.Service.prototype.getSaveNeeded = goog.abstractMethod;

/**
 * @return {string} Either a descriptor of the currently open document or an
 *     empty string if no document is open by the service.
 */
audioCat.service.Service.prototype.getOpenDocumentDescriptor =
    goog.abstractMethod;

/**
 * Asynchronously saves the content and meta data of an already opened document
 * to Drive. Opens dialogues and informs the user of that.
 */
audioCat.service.Service.prototype.saveContent = goog.abstractMethod;
