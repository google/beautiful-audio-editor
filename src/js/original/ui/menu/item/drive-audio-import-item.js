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
goog.provide('audioCat.ui.menu.item.DriveAudioImportItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.action.templates');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.state.command.ImportAudioCommand');
goog.require('audioCat.service.EventType');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for encoding the project for storing locally.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.command.CommandManager} commandManager
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.service.GoogleDriveService} service The Drive service.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.DriveAudioImportItem = function(
    idGenerator,
    commandManager,
    audioContextManager,
    domHelper,
    dialogManager,
    actionManager,
    service) {
  var self = this;
  var content = domHelper.createDiv();
  domHelper.setRawInnerHtml(content, 'Import audio file from Google Drive.');
  audioCat.ui.menu.item.DriveAudioImportItem.base(this, 'constructor', content);

  /**
   * A list of listener keys to unlisten later.
   * @private {!Array.<goog.events.Key>}
   */
  this.listenerKeys_ = [];

  // Open the picker on click.
  this.listenerKeys_.push(goog.events.listen(
      this, goog.ui.Component.EventType.ACTION, function() {
        // TODO(chizeng): Place this logic in an action so it can triggered
        // elsewhere.
        var oauthToken;
        var createPicker = function() {
          var pickerCallback = function(data) {
            // When the user clicks on a file in the picker ...
            if (data[google.picker.Response.ACTION] ==
                google.picker.Action.PICKED) {
              var doc = data[google.picker.Response.DOCUMENTS][0];
              var downloadUrl;
              var docId = doc['id'];
              goog.global.console.log(doc);
              if (!doc || !downloadUrl || !docId) {
                // No doc to open. :/
                return;
              }
              var docName = doc[google.picker.Document.NAME];
              var mimeType = doc[google.picker.Document.MIME_TYPE];
              var fileSize = doc['sizeBytes'];
              if (!mimeType || (mimeType.indexOf('audio/') != 0
                  && mimeType.indexOf('video/') != 0)) {
                // This is not an audio file. :/
                dialogManager.showDialog(dialogManager.obtainDialog(
                    'Error: <b>' + docName + '</b> is not a sound file.',
                    audioCat.ui.dialog.DialogText.CLOSE));
                return;
              }
              // Try to retrieve the file.
              var accessToken = gapi.auth.getToken().access_token;
              var xhr = new XMLHttpRequest();
              xhr.open('GET', downloadUrl, true);
              xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
              xhr.responseType = 'arraybuffer';
              
              // Create a dialog for monitoring the file.
              var loadingContent = domHelper.createDiv(
                  goog.getCssName('loadingDialog'));
              var loadingParagraph = domHelper.createDiv(
                  goog.getCssName('innerParagraphContent'));
              domHelper.setRawInnerHtml(loadingParagraph, 'Retrieving <b>' +
                  docName + '</b> (' + (fileSize / 1e6).toFixed(1) +
                  ' MB) from ' + this.getServiceName() + ' ...');
              domHelper.appendChild(loadingContent, loadingParagraph);
              var loadingWidget = new audioCat.ui.widget.LoadingWidget(
                  domHelper);
              var loadingWidgetContainer = domHelper.createDiv(
                  goog.getCssName('loadingWidgetContainer'));
              domHelper.appendChild(
                  loadingWidgetContainer, loadingWidget.getDom());
              domHelper.appendChild(loadingContent, loadingWidgetContainer);
              var loadingDialog = dialogManager.obtainDialog(loadingContent,
                  audioCat.ui.dialog.DialogText.CANCEL);
              goog.dom.classes.add(loadingDialog.getDom(),
                  goog.getCssName('topBufferedDialog'));
              loadingDialog.listenOnce(
                  audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
                    dialogManager.hideDialog(loadingDialog);
                  });

              // Create XHR handlers for loading the file.
              xhr.onload = function() {
                // Import the content.
                domHelper.setTextContent(loadingContent,
                    'Retrieved <b>' + docName + '</b>. Parsing audio ...');
                // Parse the audio.
                var fileData = /** @type {!ArrayBuffer} */ (xhr.response);
                var doneDecodingCallback = goog.bind(function(audioBuffer) {
                  // TODO(chizeng): Don't erroneously assume that the audio
                  // buffer will always be non-null. Maybe file type is invalid.
                  // Or file is too big. Handle errors gracefully. Have a little
                  // message display in the dialog.
                  audioBuffer = /** @type {!AudioBuffer} */ (audioBuffer);
                  var audioChest = new audioCat.audio.AudioChest(
                      audioBuffer,
                      docName,
                      audioCat.audio.AudioOrigination.IMPORTED,
                      idGenerator);
                  commandManager.enqueueCommand(
                      new audioCat.state.command.ImportAudioCommand(
                          idGenerator, docName, audioChest));
                  // Hide the dialog.
                  dialogManager.hideDialog(loadingDialog);
                }, this);

                var errorDecodingCallback = function() {
                  // Raise a new dialog notifying the user of how import failed.
                  var errorMessage = /** @type {!Element} */ (
                      soy.renderAsFragment(
                          audioCat.action.templates.ImportFailedMessage));
                  dialogManager.showDialog(dialogManager.obtainDialog(
                      errorMessage, audioCat.ui.dialog.DialogText.CLOSE));
                  // Hide the dialog.
                  dialogManager.hideDialog(loadingDialog);
                };

                // Start the audio rendering.
                audioContextManager.createAudioBuffer(
                    fileData, doneDecodingCallback, errorDecodingCallback);
              };
              xhr.onerror = function() {
                // Hide the loading dialog.
                dialogManager.hideDialog(loadingDialog);
                // This is not an audio file. :/
                dialogManager.showDialog(dialogManager.obtainDialog(
                    'Error retrieving <b>' + docName + '</b>.',
                    audioCat.ui.dialog.DialogText.CLOSE));
              };
              xhr.addEventListener('progress', function(event) {
                event = /** @type {!ProgressEvent} */ (event);
                loadingWidget.setProgress(event.loaded / fileSize);
              });
              dialogManager.showDialog(loadingDialog);
              var request = gapi.client.drive.files.get({
                'fileId': docId
              });
              goog.global.console.log(doc);
              request.execute(function(resp) {
                downloadUrl = resp.downloadUrl;
                if (downloadUrl) {
                  // Now that we have the download URL, use it.
                  xhr.send();
                } else {
                  // Query failed.
                  // Hide the loading dialog.
                  dialogManager.hideDialog(loadingDialog);
                  dialogManager.showDialog(dialogManager.obtainDialog(
                      'Error retrieving <b>' + docName + '</b>.',
                      audioCat.ui.dialog.DialogText.CLOSE));
                }
              });
            }
          };
          // Creates and shows a picker when ready.
          if (audioCat.ui.menu.item.DriveAudioImportItem.PickerInitialized_ &&
              oauthToken) {
            var picker = new google.picker.PickerBuilder()['addView'](
                google.picker.ViewId.DOCS)['setOAuthToken'](
                    oauthToken)['setCallback'](
                            pickerCallback)['build']();
            picker['setVisible'](true);
            // Make sure the picker is in the foreground!
            var pickerDialogBgs =
                goog.dom.getElementsByClass('picker-dialog-bg');
            for (var i = 0; i < pickerDialogBgs.length; ++i) {
              pickerDialogBgs[i].style.zIndex = 100000;
            }
            var pickerDialogs = goog.dom.getElementsByClass('picker-dialog');
            for (var i = 0; i < pickerDialogs.length; ++i) {
              pickerDialogs[i].style.zIndex = 100001;
            }
          }
        };
        // Handle auth result.
        var handleAuthResult = function(authResult) {
          if (authResult && !authResult.error) {
            oauthToken = authResult.access_token;
            audioCat.ui.menu.item.DriveAudioImportItem.OauthApiLoaded_ = true;
            createPicker();
          }
        };
        var onAuthApiLoad = function() {
          // Authorize!
          window.gapi.auth.authorize(
              {
                'client_id': service.getClientId(),
                'scope': service.getFileScopeList(),
                'immediate': false
              }, handleAuthResult);
        };
        // On the picker API being loaded ...
        var onPickerApiLoad = function() {
          audioCat.ui.menu.item.DriveAudioImportItem.PickerInitialized_ = true;
          createPicker();
        };
        // When the script tag has loaded ...
        var onPickerScriptTagLoaded = function() {
          delete goog.global['pl'];
          if (audioCat.ui.menu.item.DriveAudioImportItem.OauthApiLoaded_) {
            // Oauth api already loaded. No need to load again.
            onAuthApiLoad();
          } else {
            // Use the API Loader script to load the Authentication script.
            gapi.load('auth', {'callback': onAuthApiLoad});
          }
          if (audioCat.ui.menu.item.DriveAudioImportItem.PickerInitialized_) {
            // Picker API already loaded. No need to load again.
            onPickerApiLoad();
          } else {
            // Use the API Loader script to load the google.picker script.
            gapi.load('picker', {'callback': onPickerApiLoad});
          }
        };
        if (audioCat.ui.menu.item.DriveAudioImportItem.PickerScriptTagAdded_) {
          // Picker script tag already added. Just init.
          onPickerScriptTagLoaded();
        } else {
          // Picker not yet initialized. Append the script tag.
          goog.global['pl'] = onPickerScriptTagLoaded;
          var scriptTag = domHelper.createJavascriptTag(
              'https://apis.google.com/js/api.js?onload=pl');
          domHelper.appendChild(domHelper.getDocument().body, scriptTag);
          audioCat.ui.menu.item.DriveAudioImportItem.PickerScriptTagAdded_ =
              true;
        }
      }));
};
goog.inherits(audioCat.ui.menu.item.DriveAudioImportItem,
    audioCat.ui.menu.item.MenuItem);


/**
 * Whether the script tag for picker has been added.
 * @private {boolean}
 */
audioCat.ui.menu.item.DriveAudioImportItem.PickerScriptTagAdded_ = false;


/**
 * Whether the oauth API has loaded.
 * @private {boolean}
 */
audioCat.ui.menu.item.DriveAudioImportItem.OauthApiLoaded_ = false;


/**
 * Whether the picker API has been initialized.
 * @private {boolean}
 */
audioCat.ui.menu.item.DriveAudioImportItem.PickerInitialized_ = false;


/** @override */
audioCat.ui.menu.item.DriveAudioImportItem.prototype.disposeInternal =
    function() {
  for (var i = 0; i < this.listenerKeys_.length; ++i) {
    goog.events.unlistenByKey(this.listenerKeys_[i]);
  }
  audioCat.ui.menu.item.DriveAudioImportItem.base(this, 'disposeInternal');
};
