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
goog.provide('audioCat.action.RequestAudioImportAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.action.templates');
goog.require('audioCat.android.FileInputType');
goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.state.command.ImportAudioCommand');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.templates');
goog.require('goog.dom.classes');
goog.require('soy');


/**
 * Initiates the process of importing audio. For instance, opens the dialog.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and execution.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.RequestAudioImportAction = function(
    supportDetector,
    dialogManager,
    idGenerator,
    domHelper,
    commandManager,
    audioContextManager,
    memoryManager,
    opt_androidAmbassador) {
  goog.base(this);

  /**
   * @private {!audioCat.utility.support.SupportDetector}
   */
  this.supportDetector_ = supportDetector;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * Generates unique IDs.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages command history and thus undo/redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * Manages audio contexts.
   * @private {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager_ = audioContextManager;

  /**
   * @private {!audioCat.state.MemoryManager}
   */
  this.memoryManager_ = memoryManager;

  /**
   * Modifies an object injected into javascript from Android java. Only defined
   * if we are in an Android web view.
   * @private {audioCat.android.AndroidAmbassador|undefined}
   */
  this.androidAmbassador_ = opt_androidAmbassador;
};
goog.inherits(audioCat.action.RequestAudioImportAction, audioCat.action.Action);

/** @override */
audioCat.action.RequestAudioImportAction.prototype.doAction = function() {
  // Obtain the content for the dialog.
  var self = this;
  var supportDetector = this.supportDetector_;
  var dialogContent = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.dialog.templates.ImportAudioDialog, {
          supportedFormats: supportDetector.obtainJoinedFileExtensions(true),
          unsupportedFormats: supportDetector.obtainJoinedFileExtensions(false)
      }));

  // Create a dialog.
  var dialogManager = this.dialogManager_;
  var dialog = dialogManager.obtainDialog(
      dialogContent, audioCat.ui.dialog.DialogText.CANCEL); // Allow cancel.

  // Retrieve an OK button.
  var okButton = dialogManager.obtainButton('Import audio.');
  var domHelper = this.domHelper_;
  domHelper.appendChild(dialogContent, okButton.getDom());

  // When the button is clicked, do the audio import.
  okButton.performOnUpPress(goog.bind(function() {
      // We know the element must be constructed if the OK button is clicked.
      var domHelper = this.domHelper_;
      var inputElement = domHelper.getElementByClassForSure(
          goog.getCssName('audioUploadInputElement'), dialogContent);

      // The API returns a list of files, but we just deal with a single file.
      var files = inputElement.files;
      if (!files.length) {
        // Tell the user that he/she forgot to specify a file.
        // dialogManager.putBackButton(okButton);
        // dialogManager.hideDialog(dialog);
        var warningBox = domHelper.getElementByClassForSure(
            goog.getCssName('warningBox'), dialogContent);
        domHelper.setRawInnerHtml(warningBox, 'No file specified.<br>');
        return;
      }
      var file = files[0];
      var fileName = file.name;
      var idGenerator = this.idGenerator_;
      var fileReader = new FileReader();
      var importAudioDialog = this;

      // Create dialog stating that audio is importing ...
      var loadingDialogInstructions = domHelper.createDiv(
          goog.getCssName('innerParagraphContent'));
      domHelper.setRawInnerHtml(loadingDialogInstructions,
          'Importing ' + fileName + '...');
      var statusContainer = domHelper.createDiv();
      domHelper.setRawInnerHtml(statusContainer, 'Retrieving file content ...');
      var loadingDialogContent =
          domHelper.createDiv(goog.getCssName('topBufferedDialog'));
      var loadingDialogInnerContent =
          domHelper.createDiv(goog.getCssName('innerContentWrapper'));
      domHelper.appendChild(loadingDialogContent, loadingDialogInnerContent);
      domHelper.appendChild(
          loadingDialogInnerContent, loadingDialogInstructions);
      domHelper.appendChild(
          loadingDialogInnerContent, statusContainer);

      // Communicate progress with a loading bar.
      // The wrapper sets the height.
      var loadingWidgetWrapper = domHelper.createDiv(
          goog.getCssName('statusProgressContainer'));
      var loadingWidget = new audioCat.ui.widget.LoadingWidget(domHelper, 0.3);
      domHelper.appendChild(
          loadingWidgetWrapper, loadingWidget.getDom());
      domHelper.appendChild(
          loadingDialogInnerContent, loadingWidgetWrapper);
      var loadingDialog = dialogManager.obtainDialog(
          loadingDialogContent, audioCat.ui.dialog.DialogText.CANCEL);

      var importCanceled = false;

      // Clean up after ourselves if import was canceled.
      loadingDialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN,
          function() {
            importCanceled = true;
            if (self.androidAmbassador_) {
              // Clean up the previous attempt to allow for the next one.
              self.androidAmbassador_.cleanUpPreviousFileWrite();
            }
            if (fileReader.readyState == 1) {
              // If we're loading, abort.
              fileReader.abort();
            }
            loadingWidget.cleanUp();
          });

      fileReader.onload = function(readerLoadEvent) {
        if (!importCanceled) {
          // Only use file content if importing was not canceled.
          domHelper.setRawInnerHtml(statusContainer, 'Decoding audio ...');
          loadingWidget.setProgress(0.6);

          // TODO(chizeng): Handle file upload failure. ie invalid extensions or
          // files that are too big.
          var arrayBuffer = /** @type {!ArrayBuffer} */ (fileReader.result);
          var callback = function(audioBuffer) {
            if (!importCanceled) {
              // Only create a new track if the import was not canceled.
              domHelper.setRawInnerHtml(
                  statusContainer, 'Visualizing audio ...');
              loadingWidget.setProgress(0.8);

              // TODO(chizeng): Don't erroneously assume that the audio buffer
              // will always be non-null. Maybe file type is invalid. Or file is
              // too big. Handle errors gracefully. Have a little message
              // display in the dialog.
              audioBuffer = /** @type {!AudioBuffer} */ (audioBuffer);
              var audioChest = new audioCat.audio.AudioChest(
                  audioBuffer,
                  fileName,
                  audioCat.audio.AudioOrigination.IMPORTED,
                  idGenerator);
              var command = new audioCat.state.command.ImportAudioCommand(
                  idGenerator, fileName, audioChest);
              self.commandManager_.enqueueCommand(command);
              // Note the memory we just added.
              // self.memoryManager_.addBytes(command.getMemoryAdded());

              // Close the dialog stating that audio is importing.
              dialogManager.hideDialog(loadingDialog);
            }
          };

          var errorCallback = function(error) {
            // Close the dialog stating that audio is importing.
            dialogManager.hideDialog(loadingDialog);

            // Raise a new dialog notifying the user of how import failed.
            var errorMessage = /** @type {!Element} */ (soy.renderAsFragment(
                audioCat.action.templates.ImportFailedMessage));
            var errorImportingFileDialog =
                dialogManager.obtainDialog(
                    errorMessage, audioCat.ui.dialog.DialogText.CLOSE);
            dialogManager.showDialog(errorImportingFileDialog);
          };

          importAudioDialog.audioContextManager_.createAudioBuffer(
              arrayBuffer, callback, errorCallback);
        }
      };

      // Here, close the import dialog.
      dialogManager.putBackButton(okButton);
      dialogManager.hideDialog(dialog);

      // Show the dialog stating that audio is importing ...
      dialogManager.showDialog(loadingDialog);

      fileReader.readAsArrayBuffer(file);
    }, this));

  // If in an Android web view, tell Android java to only accept audio files.
  if (this.androidAmbassador_) {
    this.androidAmbassador_.setNextInputType(
        audioCat.android.FileInputType.AUDIO);
  }

  // Show the dialog with the audio file selector.
  dialogManager.showDialog(dialog);
};
