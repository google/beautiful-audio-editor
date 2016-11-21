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
goog.provide('audioCat.action.encode.LoadProjectStateAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.android.FileInputType');
goog.require('audioCat.state.events');
goog.require('audioCat.state.plan.Constant');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.widget.FileSelectorWidget');
goog.require('audioCat.utility.support.SupportMessage');
goog.require('goog.events.EventHandler');


/**
 * An action that first warns the user about how loading a project first clears
 * the current project and then proceeds to the UI for loading a project if the
 * user so desires.
 * @param {!audioCat.state.Project} project Encapsulates the name of the project
 *     among other primitive meta data.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.encode.ActuateProjectStateAction}
 *     actuateProjectStateAction An action that actuates the encoded state of a
 *     project - makes the current workspace reflect that project state,
 *     overriding any existing work.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.encode.LoadProjectStateAction = function(
    project,
    supportDetector,
    commandManager,
    dialogManager,
    statePlanManager,
    domHelper,
    actuateProjectStateAction,
    opt_androidAmbassador) {
  goog.base(this);
  /**
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * @private {!audioCat.utility.support.SupportDetector}
   */
  this.supportDetector_ = supportDetector;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.state.StatePlanManager}
   */
  this.statePlanManager_ = statePlanManager;

  /**
   * Reads files.
   * @private {!FileReader}
   */
  this.fileReader_ = new FileReader();

  /**
   * @private {!audioCat.action.encode.ActuateProjectStateAction}
   */
  this.actuateProjectStateAction_ = actuateProjectStateAction;

  /**
   * Modifies an object injected into javascript from Android java. Only defined
   * if we are in an Android web view.
   * @private {audioCat.android.AndroidAmbassador|undefined}
   */
  this.androidAmbassador_ = opt_androidAmbassador;
};
goog.inherits(audioCat.action.encode.LoadProjectStateAction,
    audioCat.action.Action);

/**
 * Warns the user that loading a project will override the current project.
 * Then initiates the UI for loading the project.
 * @override
 */
audioCat.action.encode.LoadProjectStateAction.prototype.doAction =
    function() {
  if (this.commandManager_.getNumberOfCommands() == 0) {
    // No commands ever issued to this project. Just load the project.
    this.continueToLoadingProject_();
    return;
  }

  // Display a dialog indicating that loading a project will override current.
  var dialogManager = this.dialogManager_;
  var domHelper = this.domHelper_;
  var warningContent =
      domHelper.createDiv(goog.getCssName('topBufferedDialog'));
  var innerContent =
      domHelper.createDiv(goog.getCssName('innerContentWrapper'));
  domHelper.appendChild(warningContent, innerContent);
  // TODO(chizeng): Only display this warning if no commands have been done.
  var warningMessage =
      domHelper.createDiv(goog.getCssName('innerParagraphContent'));
  domHelper.setTextContent(warningMessage,
      'Loading a project clears the current one first. ' +
      'This action cannot be undone. Are you sure ' +
      'you want to load a new project?');
  domHelper.appendChild(innerContent, warningMessage);
  var continueButton = dialogManager.obtainButton(
      'Continue to loading project file.');
  var warningDialog = dialogManager.obtainDialog(
      warningContent, audioCat.ui.dialog.DialogText.CANCEL);
  continueButton.performOnUpPress(goog.bind(function() {
    continueButton.clearUpPressCallback();
    dialogManager.hideDialog(warningDialog);
    this.continueToLoadingProject_();
  }, this));
  domHelper.appendChild(innerContent, continueButton.getDom());
  // Put the button back if the dialog is about to be hidden.
  warningDialog.listenOnce(
      audioCat.ui.dialog.EventType.BEFORE_HIDDEN,
      goog.partial(dialogManager.putBackButton, continueButton),
      false, dialogManager);
  dialogManager.showDialog(warningDialog);
};

/**
 * Warns the user that loading a project will override the current project.
 * Then initiates the UI for loading the project.
 * @private
 */
audioCat.action.encode.LoadProjectStateAction.prototype.
    continueToLoadingProject_ = function() {
  // Display a dialog that lets the user load a project file.
  var dialogManager = this.dialogManager_;
  var domHelper = this.domHelper_;
  var content = domHelper.createDiv(goog.getCssName('topBufferedDialog'));
  var innerContent =
      domHelper.createDiv(goog.getCssName('innerContentWrapper'));
  var dialog = dialogManager.obtainDialog(
      content, audioCat.ui.dialog.DialogText.CANCEL);

  // Create a box for errors/warnings.
  var warningBox = domHelper.createDiv(goog.getCssName('warningBox'));
  domHelper.appendChild(innerContent, warningBox);

  // Create instructions.
  var instructions = 'Select an audio project (.audioproject file) to load.';
  var instructionsDom =
      domHelper.createDiv(goog.getCssName('innerParagraphContent'));
  domHelper.setTextContent(instructionsDom, instructions);
  domHelper.appendChild(innerContent, instructionsDom);

  // Create a widget for selecting files.
  var fileSelectorWidget = new audioCat.ui.widget.FileSelectorWidget(domHelper);
  domHelper.appendChild(innerContent, fileSelectorWidget.getDom());

  // Create a button for loading the project.
  var loadButton = dialogManager.obtainButton(
      'Load project, overriding existing work.');
  domHelper.appendChild(innerContent, loadButton.getDom());

  // Handle the main button being clicked.
  loadButton.performOnUpPress(goog.bind(function() {
    var filesSelected = fileSelectorWidget.getCurrentFiles();
    if (!filesSelected.length) {
      domHelper.setTextContent(warningBox, 'No file selected.');
      return;
    }
    var file = filesSelected[0];
    var fileName = file.name;
    var needle = '.' + audioCat.state.plan.Constant.PROJECT_EXTENSION;
    if (fileName.substring(fileName.length - needle.length) != needle) {
      domHelper.setTextContent(
          warningBox, 'This file is not an audio project.');
      return;
    }

    // Prevent the user from reading the file twice by clicking on the button
    // twice.
    loadButton.clearUpPressCallback();

    var eventHandler = new goog.events.EventHandler(this);
    eventHandler.listen(this.fileReader_, 'load', function() {
      dialogManager.hideDialog(dialog);
      eventHandler.dispose();
      // Only actuate the project state if the import is not canceled.
      var actuateProjectStateAction = this.actuateProjectStateAction_;
      actuateProjectStateAction.setFileName(fileName);
      actuateProjectStateAction.setEncoding(
          /** @type {ArrayBuffer} */ (this.fileReader_.result));
      actuateProjectStateAction.doAction();
    }, false);
    eventHandler.listen(this.fileReader_, 'error', function() {
      // Display an error message.
      // TODO(chizeng): Centralize displaying an error message.
      dialogManager.hideDialog(dialog);
      eventHandler.dispose();
      var errorContent =
          domHelper.createDiv(goog.getCssName('topBufferedDialog'));
      var errorInnerContent =
          domHelper.createDiv(goog.getCssName('innerContentWrapper'));
      domHelper.setTextContent(errorInnerContent,
          'Error: Your project is likely too big. Please contact ' +
              'us to recover the data.').
      domHelper.appendChild(errorContent, errorInnerContent);
      var errorDialog = dialogManager.obtainDialog(
          errorContent, audioCat.ui.dialog.DialogText.CLOSE);
      dialogManager.showDialog(errorDialog);
    }, false);
    // Read the project into an array buffer.
    this.fileReader_.readAsArrayBuffer(file);
  }, this));

  // Do some clean up once the dialog message is hidden.
  dialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
      dialogManager.putBackButton(loadButton);
      this.fileReader_.abort();
      fileSelectorWidget.cleanUp();
  }, false, this);
  domHelper.appendChild(content, innerContent);

  // If in an Android web view, tell Android java to only accept project files.
  if (this.androidAmbassador_) {
    this.androidAmbassador_.setNextInputType(
        audioCat.android.FileInputType.APPLICATION_AUDIO_PROJECT);
  }

  // Show the dialog with the project file selector.
  dialogManager.showDialog(dialog);
};
