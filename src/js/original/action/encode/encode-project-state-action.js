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
goog.provide('audioCat.action.encode.EncodeProjectStateAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.events');
goog.require('audioCat.state.plan.Constant');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.utility.support.SupportMessage');


/**
 * An action for encoding the state of the project.
 * @param {!audioCat.state.Project} project Encapsulates the name of the project
 *     among other primitive meta data.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.SaveChecker} saveChecker Checks to see if we saved
 *     all changes at any moment.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.utility.DataUrlParser} dataUrlParser Parses data URLs.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.encode.EncodeProjectStateAction = function(
    project,
    supportDetector,
    dialogManager,
    saveChecker,
    statePlanManager,
    messageManager,
    domHelper,
    dataUrlParser,
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
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.state.SaveChecker}
   */
  this.saveChecker_ = saveChecker;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.state.StatePlanManager}
   */
  this.statePlanManager_ = statePlanManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * @private {!audioCat.utility.DataUrlParser}
   */
  this.dataUrlParser_ = dataUrlParser;

  /**
   * @private {audioCat.android.AndroidAmbassador|undefined}
   */
  this.androidAmbassador_ = opt_androidAmbassador;
};
goog.inherits(audioCat.action.encode.EncodeProjectStateAction,
    audioCat.action.Action);

/**
 * Encodes the state of a project into a .audioproject file. And then enables
 * the user to download it.
 * @override
 */
audioCat.action.encode.EncodeProjectStateAction.prototype.doAction =
    function() {
  this.statePlanManager_.listenOnce(audioCat.state.events.ENCODING_DONE,
      this.handleEncodingDone_, false, this);
  this.statePlanManager_.produceEncoding();
};

/**
 * Handles what happens when encoding is done. Could be done asynchronously if
 * we are say writing data to Android.
 * @param {!audioCat.state.EncodingDoneEvent} event The event associated with
 *     encoding being done.
 * @private
 */
audioCat.action.encode.EncodeProjectStateAction.prototype.handleEncodingDone_ =
    function(event) {
  // Generate the file URL.
  var audioProjectDatablob = event.getEncoding();
  if (this.androidAmbassador_) {
    this.handleDataGenerated_(
          // We do not use URLs for android.
          '',
          audioProjectDatablob.size, // The size in bytes.
          audioProjectDatablob // The blob to write.
        );
  } else {
    // Generate an object URL.
    this.handleDataGenerated_(
        goog.global.URL.createObjectURL(audioProjectDatablob),
        audioProjectDatablob.size,
        null // For Desktop, do not create an array buffer.
      );
  }
};

/**
 * Handles the completion of URL generation.
 * @param {string} url This is either an empty string (if we're in a web view)
 *     or an object URL (most cases like Desktop).
 * @param {number} projectFileSize The size of the project file in bytes.
 * @param {Blob} fileData The data for the file. Or null if not
 *     generated.
 * @private
 */
audioCat.action.encode.EncodeProjectStateAction.prototype.handleDataGenerated_ =
    function(url, projectFileSize, fileData) {
  // Create the dialog for downloading.
  var domHelper = this.domHelper_;
  var dialogManager = this.dialogManager_;
  var dialogCloseText = audioCat.ui.dialog.DialogText.CLOSE;

  // Show a dialog for indicating that we're generating the file content.
  var tempContent = domHelper.createDiv();
  domHelper.setTextContent(tempContent, 'Generating project file ...');
  var generatingDialog = dialogManager.obtainDialog(tempContent);
  goog.global.setTimeout(function() {
    // Asynchronously show the dialog so we're not blocked by the main thread.
    dialogManager.showDialog(generatingDialog);
  }, 1);

  // Show a dialog when we finish. The dialog provides the link for download.
  var dialogContent = domHelper.createDiv(
      goog.getCssName('wavExportDoneDialog'));
  goog.dom.classes.add(
      dialogContent, goog.getCssName('topBufferedDialog'));

  // Offer some instructions.
  var instructions = domHelper.createElement('p');
  domHelper.setRawInnerHtml(instructions,
      'Download this project and load it later to continue working on it.<br>');
  domHelper.appendChild(dialogContent, instructions);

  // Note the file size.
  var sizePortion = domHelper.createDiv();
  domHelper.setTextContent(sizePortion, 'Size: ');
  var actualSizeString = domHelper.createElement('span');
  goog.dom.classes.add(actualSizeString, goog.getCssName('valuePortion'));
  // Display memory to the nearest (higher) tenth of an MB.
  domHelper.setTextContent(
      actualSizeString,
      (Math.ceil(projectFileSize / 1e5) / 10).toFixed(1) + ' MB');
  domHelper.appendChild(sizePortion, actualSizeString);
  domHelper.appendChild(dialogContent, sizePortion);

  // Note the file name, and provide a download link.
  var fileNamePortion = domHelper.createDiv();
  domHelper.setTextContent(fileNamePortion, 'File: ');
  var fileLink = domHelper.createElement('a');
  goog.dom.classes.add(fileLink, goog.getCssName('valuePortion'));
  var fileName = this.project_.getTitle() + '.' +
      audioCat.state.plan.Constant.PROJECT_EXTENSION;
  var supportDetector = this.supportDetector_;
  var handleDownloadLinkClickForAndroid;
  var cleanUpAndroidSave;
  var dialog;
  if (supportDetector.getDownloadAttributeSupported()) {
    domHelper.setTextContent(fileLink, fileName);
    var androidAmbassador = this.androidAmbassador_;
    if (androidAmbassador) {
      /** @param {!goog.events.BrowserEvent} event */
      var self = this;
      handleDownloadLinkClickForAndroid = function(event) {
        event.preventDefault();

        // Write a cleanup function.
        var loadingWidget;
        var socket;
        cleanUpAndroidSave = function() {
          if (loadingWidget) {
            loadingWidget.cleanUp();
            loadingWidget = null;
          }
          if (socket) {
            socket.close();
            socket = null;
          }
          androidAmbassador.cleanUpPreviousFileWrite();
          cleanUpAndroidSave = null;
        };

        // Hide link.
        domHelper.removeNode(fileLink);

        // Create status message and progress bar.
        var statusProgressContainer = domHelper.createDiv(
            goog.getCssName('statusProgressContainer'));
        var statusMessage = domHelper.createDiv();
        domHelper.setRawInnerHtml(statusMessage,
            'Saving ' + fileName + ' to your Documents directory ...');
        loadingWidget = new audioCat.ui.widget.LoadingWidget(
            domHelper);
        domHelper.appendChild(statusProgressContainer, statusMessage);
        domHelper.appendChild(
            statusProgressContainer, loadingWidget.getDom());
        domHelper.appendChild(dialogContent, statusProgressContainer);

        // Register file write.
        androidAmbassador.registerAudioFileWrite(
            fileName,
            audioCat.state.plan.Constant.PROJECT_MIME_TYPE,
            projectFileSize);

        // Begin tracking number of bytes passed over to Android.
        var bytesSaved = 0;

        // Open socket.
        socket = new WebSocket(
            androidAmbassador.getFileWritingSocketString());

        // Method for reporting errors. And then cleaning up.
        var endWithError = function(errorMessageString) {
          domHelper.removeNode(loadingWidget.getDom());
          domHelper.setRawInnerHtml(statusMessage, errorMessageString);
          self.messageManager_.issueMessage(errorMessageString,
              audioCat.ui.message.MessageType.DANGER);
          cleanUpAndroidSave();
        };

        // Handle errant case.
        var genericErrorMessage =
              'Error saving: Make sure you have enough memory ' +
              'and a folder named Music.';
        socket.onerror = function(error) {
          endWithError(genericErrorMessage);
        };

        // Updates progress based on how much data we've sent over.
        // Leave 5% for actually writing the file.
        var updateProgress = function(bytesSavedSoFar) {
          loadingWidget.setProgress(bytesSavedSoFar / projectFileSize * 0.95);
        };

        // Handle when messages are received.
        socket.onmessage = function(messageEvent) {
          // Note how many bytes we've saved so far.
          bytesSaved += goog.string.toNumber(messageEvent.data);
          updateProgress(bytesSaved);
          if (bytesSaved == projectFileSize) {
            var fileWriteSuccessful = true;
            try {
              // We've sent over all bytes. Start saving the file.
              androidAmbassador.startWritingFile();
            } catch (e) {
              fileWriteSuccessful = false;
            } finally {
              if (fileWriteSuccessful) {
                // Successfully wrote audio file. :)
                // Hiding also automatically cleans up.
                dialogManager.hideDialog(dialog);
                self.messageManager_.issueMessage(
                    'Saved ' + fileName +
                    ' to your Documents folder for later import.');
              } else {
                // File writing failed. :(
                endWithError(genericErrorMessage);
              }
            }
          }
        };

        // Send file data to the server when socket opens.
        // Suppress type-checking since Closure only lets us send array buffers
        // for some reason.
        /** @suppress {checkTypes} */
        socket.onopen = function() {
          socket.send(fileData);
        };

        // // Send the data from the data URL to Android to save.
        // var downloadSuccess = true;
        // try {
        //   self.androidAmbassador_.writeProjectFile(
        //       fileName, // File name of project.
        //       // Byte data for the file.
        //       /** @type {!ArrayBuffer} */ (fileData),
        //       audioCat.state.plan.Constant.PROJECT_MIME_TYPE // Mime type.
        //     );
        //   dialogManager.hideDialog(dialog);
        // } catch (e) {
        //   downloadSuccess = false;
        // } finally {
        //   // Report the success or failure of the save on Android.
        //   self.messageManager_.issueMessage(
        //       downloadSuccess ?
        //           'Saved the project file to your Documents folder.' :
        //           'Error: Could not save project file.',
        //       downloadSuccess ?
        //           audioCat.ui.message.MessageType.SUCCESS :
        //           audioCat.ui.message.MessageType.DANGER);
        // }
        return false;
      };
      fileLink.setAttribute('href', '#');
      domHelper.listenForPress(
          fileLink, handleDownloadLinkClickForAndroid, false, this);
    } else {
      // Set the URL, and make it downloadable.
      // This corresponds to the normal Desktop case.
      fileLink.setAttribute('href', url);
      fileLink.setAttribute('download', fileName);
    }
  } else {
    // TODO(chizeng): Use an alternative for downloading such as
    // Downloadify.
    var text = audioCat.utility.support.SupportMessage.NO_DOWNLOAD_LINK;
    var textSpan = domHelper.createElement('span');
    domHelper.setRawInnerHtml(textSpan, text);
    domHelper.appendChild(fileNamePortion, textSpan);
  }
  domHelper.appendChild(fileNamePortion, fileLink);
  domHelper.appendChild(dialogContent, fileNamePortion);

  dialog = dialogManager.obtainDialog(dialogContent, dialogCloseText);
  goog.dom.classes.add(
      dialog.getDom(), goog.getCssName('topBufferedDialog'));

  // Revoke the URL once the dialog closes.
  dialog.listenOnce(
      audioCat.ui.dialog.EventType.BEFORE_HIDDEN,
      function() {
        if (supportDetector.getDownloadAttributeSupported()) {
          // Revoke the new URL if we generated one.
          goog.global.URL.revokeObjectURL(url);
        }
        if (handleDownloadLinkClickForAndroid) {
          domHelper.unlistenForPress(
              fileLink, handleDownloadLinkClickForAndroid, false, this);
        }
        if (cleanUpAndroidSave) {
          // Clean up after ourselves.
          cleanUpAndroidSave();
        }
      }, false, this);
  var saveChecker = this.saveChecker_;
  goog.global.setTimeout(function() {
    // Asynchronously update dialogs to respect ordering in light of earlier
    // asynchronous action.
    dialogManager.hideDialog(generatingDialog);
    saveChecker.markNewLocalProjectDownload();
    dialogManager.showDialog(dialog);
  }, 1);
};
