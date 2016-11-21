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
goog.provide('audioCat.action.render.ExportAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.audio.render.ExportFormat');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.utility.EventHandler');
goog.require('audioCat.utility.support.SupportMessage');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.string');


/**
 * Exports the audio project as an audio file of some format.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages the
 *     display of dialog messages.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.utility.DataUrlParser} dataUrlParser Parses data URLs.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.render.ExportAction = function(
    exportManager,
    domHelper,
    messageManager,
    dialogManager,
    supportDetector,
    dataUrlParser,
    opt_androidAmbassador) {
  goog.base(this);

  /**
   * The format that this action will export into upon the next call to do the
   * action.
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.exportFormat_ = audioCat.audio.render.ExportFormat.WAV;

  /**
   * Manages exporting audio.
   * @private {!audioCat.audio.render.ExportManager}
   */
  this.exportManager_ = exportManager;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Issues messages to the user.
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.utility.support.SupportDetector}
   */
  this.supportDetector_ = supportDetector;

  /**
   * @private {!audioCat.utility.DataUrlParser}
   */
  this.dataUrlParser_ = dataUrlParser;

  /**
   * @private {audioCat.android.AndroidAmbassador|undefined}
   */
  this.androidAmbassador_ = opt_androidAmbassador;
};
goog.inherits(audioCat.action.render.ExportAction, audioCat.action.Action);

/** @override */
audioCat.action.render.ExportAction.prototype.doAction = function() {
  var exportManager = this.exportManager_;
  var domHelper = this.domHelper_;
  var messageManager = this.messageManager_;
  var supportDetector = this.supportDetector_;
  var eventHandler = new audioCat.utility.EventHandler(this);

  var dialogManager = this.dialogManager_;
  var dialogCloseText = audioCat.ui.dialog.DialogText.CLOSE;
  var brText = '<br>';

  // The format to export into.
  var exportFormat = this.exportFormat_;
  var formatAbbreviation;
  var mimeType;
  if (exportFormat == audioCat.audio.render.ExportFormat.WAV) {
    formatAbbreviation = 'WAV';
    mimeType = 'audio/wav';
  } else if (exportFormat == audioCat.audio.render.ExportFormat.MP3) {
    formatAbbreviation = 'MP3';
    mimeType = 'audio/mpeg';
  }
  goog.asserts.assert(goog.isDef(formatAbbreviation));
  goog.asserts.assert(mimeType);

  // On export success, issue a message.
  eventHandler.listen(
      exportManager,
      audioCat.audio.render.EventType.EXPORTING_SUCCEEDED,
      function(event) {
        if ((/** @type {!audioCat.audio.render.ExportingSucceededEvent} */ (
            event)).getFormat() != exportFormat) {
          // The export was not for this format.
          return;
        }
        // Remove listeners, and display a message.
        eventHandler.dispose();
        var successMessage = formatAbbreviation + ' file created successfully.';
        messageManager.issueMessage(
              successMessage,
              audioCat.ui.message.MessageType.SUCCESS);

        // Show a dialog too. The dialog provides the link for download.
        var dialogContent = domHelper.createDiv(
            goog.getCssName('wavExportDoneDialog'));
        goog.dom.classes.add(
            dialogContent, goog.getCssName('topBufferedDialog'));

        // Note the file size.
        var sizePortion = domHelper.createDiv();
        domHelper.setTextContent(sizePortion, 'Size: ');
        var actualSizeString = domHelper.createElement('span');
        goog.dom.classes.add(actualSizeString, goog.getCssName('valuePortion'));
        var fileSizeInMb = event.getFileSizeInBytes() / 1e6;
        domHelper.setTextContent(
            actualSizeString, fileSizeInMb.toFixed(1) + ' MB');
        domHelper.appendChild(sizePortion, actualSizeString);
        domHelper.appendChild(dialogContent, sizePortion);

        // Note the file name, and provide a download link.
        var fileNamePortion = domHelper.createDiv();
        domHelper.setTextContent(fileNamePortion, 'File: ');
        var fileLink = domHelper.createElement('a');
        goog.dom.classes.add(fileLink, goog.getCssName('valuePortion'));
        var dialog;
        var fileName = event.getFileName();
        var handleAndroidDownloadClick;
        var cleanUpAndroidSave;
        var socket;
        if (supportDetector.getDownloadAttributeSupported()) {
          domHelper.setTextContent(fileLink, event.getFileName());
          // Set the URL, and make it downloadable.
          var androidAmbassador = this.androidAmbassador_;
          if (androidAmbassador) {
            /** @param {!goog.events.BrowserEvent} e */
            handleAndroidDownloadClick = goog.bind(function(clickEvent) {
              clickEvent.preventDefault();

              // Write a cleanup function.
              var loadingWidget;
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
              };

              // Hide link.
              domHelper.removeNode(fileLink);

              // Create status message and progress bar.
              var statusProgressContainer = domHelper.createDiv(
                  goog.getCssName('statusProgressContainer'));
              var statusMessage = domHelper.createDiv();
              domHelper.setRawInnerHtml(statusMessage,
                  'Saving ' + fileName + ' to your Music directory ...');
              loadingWidget = new audioCat.ui.widget.LoadingWidget(
                  domHelper);
              domHelper.appendChild(statusProgressContainer, statusMessage);
              domHelper.appendChild(
                  statusProgressContainer, loadingWidget.getDom());
              domHelper.appendChild(dialogContent, statusProgressContainer);

              // Register file write.
              var fileDataArrayBuffer = event.getFileArrayBuffer();
              var fileSize = fileDataArrayBuffer.byteLength;
              androidAmbassador.registerAudioFileWrite(
                  fileName, mimeType, fileSize);

              // Begin tracking number of bytes loaded.
              var bytesSaved = 0;

              // Open socket.
              socket = new WebSocket(
                  androidAmbassador.getFileWritingSocketString());

              // Method for reporting errors. And then cleaning up.
              var endWithError = function(errorMessageString) {
                domHelper.removeNode(loadingWidget.getDom());
                domHelper.setRawInnerHtml(statusMessage, errorMessageString);
                messageManager.issueMessage(errorMessageString,
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
                loadingWidget.setProgress(bytesSavedSoFar / fileSize * 0.95);
              };

              // Handle when messages are received.
              socket.onmessage = function(messageEvent) {
                var messageValue = goog.string.toNumber(messageEvent.data);
                if (messageValue < 0) {
                  // Some error occurred.
                  endWithError(genericErrorMessage);
                  return;
                }
                // Note how many bytes we've saved so far.
                bytesSaved += messageValue;
                updateProgress(bytesSaved);
                if (bytesSaved == fileSize) {
                  var fileWriteSuccessful = true;
                  try {
                    // We've sent over all bytes. Start saving the file.
                    androidAmbassador.startWritingFile();
                  } catch (e) {
                    fileWriteSuccessful = false;
                  } finally {
                    if (fileWriteSuccessful) {
                      // Successfully wrote audio file. :)
                      dialogManager.hideDialog(dialog);
                      messageManager.issueMessage(
                          'Saved ' + fileName + ' to your Music folder.');

                    } else {
                      // File writing failed. :(
                      endWithError(genericErrorMessage);
                    }
                  }
                }
              };

              // Send file data to the server when socket opens.
              // todo - just send back the blob if this works.
              socket.onopen = function() {
                socket.send(new Blob([fileDataArrayBuffer], {
                    type: 'audio/wav'
                  }));
              };

              // clickEvent.preventDefault();
              // try {
              //   this.androidAmbassador_.writeAudioFile(
              //       fileName,
              //       /** @type {!ArrayBuffer} */ (),
              //       mimeType);
              // } catch (e) {
              //   // Oh no, download failed.
              //   downloadSucceeded = 0;
              //   this.messageManager_.issueMessage(
              //       'Error saving. You are likely short on memory.',
              //       audioCat.ui.message.MessageType.DANGER);
              // } finally {
              //   // If download succeeded, let the user know.
              //   if (downloadSucceeded) {
              //     this.messageManager_.issueMessage(
              //       'Saved ' + fileName + ' to the <b>Music</b> folder.',
              //       audioCat.ui.message.MessageType.SUCCESS);
              //   }
              // }
              // return false;
            }, this);
            fileLink.setAttribute('href', '#');
            domHelper.listenForPress(
                fileLink, handleAndroidDownloadClick, false, this);
          } else {
            // Let the user download the file.
            fileLink.setAttribute('href', event.getUrl());
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
                goog.global.URL.revokeObjectURL(event.getUrl());
              }
              if (handleAndroidDownloadClick) {
                // Stop listening for clicks that write to Android.
                domHelper.unlistenForPress(
                    fileLink, handleAndroidDownloadClick, false, this);
              }
              if (cleanUpAndroidSave) {
                // Clean up after the previous Android save operation.
                cleanUpAndroidSave();
              }
            }, false, this);

        dialogManager.showDialog(dialog);
      });

  // On export failure, issue a message.
  eventHandler.listen(
      exportManager,
      audioCat.audio.render.EventType.EXPORTING_FAILED,
      /** @param {!audioCat.audio.render.ExportingFailedEvent} failedEvent */
      function(failedEvent) {
        if (exportFormat == failedEvent.getFormat()) {
          // This failure is relevant to this format.
          // Remove listeners, and display a message.
          eventHandler.dispose();
          var wholeErrorMessage = 'The ' + formatAbbreviation +
              ' file could not be created.';
          var specifics = failedEvent.getErrorMessage();
          if (specifics.length) {
            wholeErrorMessage += ' ' + specifics;
          }

          // Issue a message, and display a dialog with the message.
          messageManager.issueMessage(
                wholeErrorMessage,
                audioCat.ui.message.MessageType.DANGER);
          if (specifics.length) {
            // Elaborate on specifics in a dialog message.
            var dialog = dialogManager.obtainDialog(
                wholeErrorMessage, dialogCloseText);
            dialogManager.showDialog(dialog);
          }
        }
      });

  // Start export.
  messageManager.issueMessage('Exporting ' + formatAbbreviation + ' file ...');
  exportManager.exportFile(exportFormat);
};

/**
 * Sets the format that the next call to do an action will export into.
 * @param {audioCat.audio.render.ExportFormat} format
 */
audioCat.action.render.ExportAction.prototype.setExportFormat =
    function(format) {
  this.exportFormat_ = format;
};
