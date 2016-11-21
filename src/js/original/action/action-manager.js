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
goog.provide('audioCat.action.ActionManager');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.action.CheckForGenericSaveNeededAction');
goog.require('audioCat.action.DisplayEffectSelectorAction');
goog.require('audioCat.action.OpenLicenseValidatorAction');
goog.require('audioCat.action.RenderAudioAction');
goog.require('audioCat.action.RequestAudioImportAction');
goog.require('audioCat.action.ShowDocumentationAction');
goog.require('audioCat.action.command.RedoAction');
goog.require('audioCat.action.command.UndoAction');
goog.require('audioCat.action.encode.ActuateProjectStateAction');
goog.require('audioCat.action.encode.EncodeProjectStateAction');
goog.require('audioCat.action.encode.LoadProjectStateAction');
goog.require('audioCat.action.mode.ChangeEditModeAction');
goog.require('audioCat.action.play.PlayPauseAction');
goog.require('audioCat.action.record.ToggleDefaultRecordAction');
goog.require('audioCat.action.render.RenderToTrackAction');
goog.require('audioCat.action.service.SaveToServiceAction');
goog.require('audioCat.action.track.SnapToGridAction');
goog.require('audioCat.action.track.ToggleSignatureTimeGridAction');
goog.require('audioCat.action.zoom.ZoomInAction');
goog.require('audioCat.action.zoom.ZoomOutAction');
goog.require('audioCat.action.zoom.ZoomToDefaultAction');
goog.require('goog.asserts');


/**
 * Organizes actions. Makes them easy to retrieve.
 * @param {!audioCat.state.Project} project Contains the name of the project
 *     among other basic meta information.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.service.ServiceManager} serviceManager Integrates with
 *     other services such as Google Drive.
 * @param {!audioCat.state.SaveChecker} saveChecker Checks to see if we saved
 *     all changes at any moment.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages different types of effects.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Manages
 *     effects on master - the project as a whole.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout this single-threaded application.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio contexts. Interfaces with the web audio API.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio.
 * @param {!audioCat.audio.record.MediaRecordManager} mediaRecordManager Manages
 *     recording of media.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Maintains
 *     and updates the current edit mode.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the time-domain scale as well as whether
 *     to display with bars or time units.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.state.LicenseManager} licenseManager Manages licensing.
 * @param {!audioCat.utility.DataUrlParser} dataUrlParser Parses data URLs.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 */
audioCat.action.ActionManager = function(
    project,
    domHelper,
    supportDetector,
    prefManager,
    commandManager,
    serviceManager,
    saveChecker,
    dialogManager,
    effectModelController,
    masterEffectManager,
    idGenerator,
    audioContextManager,
    memoryManager,
    playManager,
    audioRenderer,
    mediaRecordManager,
    editModeManager,
    timeDomainScaleManager,
    messageManager,
    statePlanManager,
    licenseManager,
    dataUrlParser,
    opt_androidAmbassador) {
  var actionMap = {};
  /**
   * A mapping from action type to an instance of that action.
   * @private {!Object.<audioCat.action.ActionType, !audioCat.action.Action>}
   */
  this.actionMap_ = actionMap;

  // Exporting depends on this action.
  var renderAudioAction = new audioCat.action.RenderAudioAction(
      domHelper,
      dialogManager,
      audioRenderer);

  actionMap[audioCat.action.ActionType.CHANGE_EDIT_MODE] =
      new audioCat.action.mode.ChangeEditModeAction(
          editModeManager,
          messageManager),
  actionMap[audioCat.action.ActionType.CHECK_FOR_GENERIC_SAVE_NEEDED] =
      new audioCat.action.CheckForGenericSaveNeededAction(
          domHelper,
          serviceManager,
          saveChecker),
  actionMap[audioCat.action.ActionType.DISPLAY_EFFECT_SELECTOR] =
      new audioCat.action.DisplayEffectSelectorAction(domHelper,
          commandManager,
          dialogManager,
          effectModelController,
          masterEffectManager,
          idGenerator);
  actionMap[audioCat.action.ActionType.ENCODE_PROJECT] =
      new audioCat.action.encode.EncodeProjectStateAction(
          project,
          supportDetector,
          dialogManager,
          saveChecker,
          statePlanManager,
          messageManager,
          domHelper,
          dataUrlParser,
          opt_androidAmbassador);
  actionMap[audioCat.action.ActionType.ACTUATE_PROJECT_STATE] =
      new audioCat.action.encode.ActuateProjectStateAction(
          supportDetector,
          dialogManager,
          statePlanManager,
          domHelper);
  actionMap[audioCat.action.ActionType.LOAD_PROJECT_STATE] =
      new audioCat.action.encode.LoadProjectStateAction(
          project,
          supportDetector,
          commandManager,
          dialogManager,
          statePlanManager,
          domHelper,
          actionMap[audioCat.action.ActionType.ACTUATE_PROJECT_STATE],
          opt_androidAmbassador);
  actionMap[audioCat.action.ActionType.REQUEST_IMPORT_AUDIO] =
      new audioCat.action.RequestAudioImportAction(
          supportDetector,
          dialogManager,
          idGenerator,
          domHelper,
          commandManager,
          audioContextManager,
          memoryManager,
          opt_androidAmbassador);
  actionMap[audioCat.action.ActionType.OPEN_LICENSE_VALIDATOR] =
      new audioCat.action.OpenLicenseValidatorAction(
          dialogManager,
          messageManager,
          idGenerator,
          domHelper,
          serviceManager,
          licenseManager);
  actionMap[audioCat.action.ActionType.PLAY_PAUSE] =
      new audioCat.action.play.PlayPauseAction(
          playManager);
  actionMap[audioCat.action.ActionType.REDO] =
      new audioCat.action.command.RedoAction(
          commandManager,
          messageManager);
  actionMap[audioCat.action.ActionType.RENDER_AUDIO_ACTION] = renderAudioAction;
  actionMap[audioCat.action.ActionType.RENDER_TO_TRACK] =
      new audioCat.action.render.RenderToTrackAction(
          audioRenderer,
          commandManager,
          idGenerator,
          messageManager,
          memoryManager,
          renderAudioAction);
  actionMap[audioCat.action.ActionType.SAVE_TO_SERVICE] =
      new audioCat.action.service.SaveToServiceAction(
          domHelper,
          serviceManager,
          dialogManager);
  actionMap[audioCat.action.ActionType.SNAP_TO_GRID] =
      new audioCat.action.track.SnapToGridAction(
          editModeManager,
          messageManager);
  actionMap[audioCat.action.ActionType.SHOW_DOCUMENTATION] =
      new audioCat.action.ShowDocumentationAction(
          domHelper);
  actionMap[audioCat.action.ActionType.TOGGLE_DEFAULT_RECORDING] =
      new audioCat.action.record.ToggleDefaultRecordAction(
          mediaRecordManager,
          playManager,
          messageManager,
          prefManager);
  actionMap[audioCat.action.ActionType.TOGGLE_SIGNATURE_TIME_GRID] =
      new audioCat.action.track.ToggleSignatureTimeGridAction(
          timeDomainScaleManager,
          messageManager);
  actionMap[audioCat.action.ActionType.UNDO] =
      new audioCat.action.command.UndoAction(
          commandManager,
          messageManager);
  actionMap[audioCat.action.ActionType.ZOOM_IN] =
      new audioCat.action.zoom.ZoomInAction(
          timeDomainScaleManager,
          messageManager);
  actionMap[audioCat.action.ActionType.ZOOM_OUT] =
      new audioCat.action.zoom.ZoomOutAction(
          timeDomainScaleManager,
          messageManager);
  actionMap[audioCat.action.ActionType.ZOOM_TO_DEFAULT] =
      new audioCat.action.zoom.ZoomToDefaultAction(
          timeDomainScaleManager,
          messageManager);
};

/**
 * Adds an action to the manager for later retrieval.
 * @param {audioCat.action.ActionType} actionType the type of action to add.
 * @param {!audioCat.action.Action} action The action to add.
 */
audioCat.action.ActionManager.prototype.addAction = function(
    actionType,
    action) {
  this.actionMap_[actionType] = action;
};

/**
 * Retrieves an action given its type. Assumes the action exists, lest an
 * assert statement is broken.
 * @param {audioCat.action.ActionType} actionType The type of the action.
 * @return {!audioCat.action.Action} The associated action.
 */
audioCat.action.ActionManager.prototype.retrieveAction = function(actionType) {
  var action = this.actionMap_[actionType];
  goog.asserts.assert(action);
  return action;
};
