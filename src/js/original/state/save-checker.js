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
goog.provide('audioCat.state.SaveChecker');


/**
 * Checks whether the user saved before the user leaves the editor. Warns the
 * user if not.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages
 *     integration with other services.
 * @constructor
 */
audioCat.state.SaveChecker = function(
    domHelper,
    commandManager,
    serviceManager) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  /**
   * The command manager epoch at the last time the user saved the project as a
   * local file.
   * @private {audioCat.utility.Id}
   */
  this.lastProjectDownloadEpochId_ = /** @type {audioCat.utility.Id} */ (-1);

  /**
   * The ID of the job to undo next at the time of the previous local project
   * download. Or -1 if none yet.
   * @private {audioCat.utility.Id}
   */
  this.lastJobToUndoId_ = /** @type {audioCat.utility.Id} */ (-1);
  this.markNewLocalProjectDownload();
};

/**
 * Marks a new local project download.
 */
audioCat.state.SaveChecker.prototype.markNewLocalProjectDownload = function() {
  this.lastProjectDownloadEpochId_ = this.commandManager_.getCurrentEpochId();
  var command = this.commandManager_.getNextCommandToUndo();
  this.lastJobToUndoId_ =
      command ? command.getId() : /** @type {audioCat.utility.Id} */ (-1);
};

/**
 * Computes whether the user has outstanding changes. If we integrate with a
 * service, this decision depends on whether we saved to the service. Otherwise,
 * the decision hinges on the last time the user locally downloaded the project.
 * @return {boolean} Whether there are outstanding changes.
 */
audioCat.state.SaveChecker.prototype.checkForOutstandingChanges = function() {
  var service = this.serviceManager_.getPrimaryService();
  if (service) {
    return service.getSaveNeeded();
  } else {
    // No service. Check the last download.
    var commandManager = this.commandManager_;
    if (this.lastProjectDownloadEpochId_ !=
        commandManager.getCurrentEpochId()) {
      return true;
    } else {
      var command = this.commandManager_.getNextCommandToUndo();
      return this.lastJobToUndoId_ !=
          (command ? command.getId() : /** @type {audioCat.utility.Id} */ (-1));
    }
  }
};
