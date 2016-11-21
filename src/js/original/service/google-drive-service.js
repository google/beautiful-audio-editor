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
goog.provide('audioCat.service.GoogleDriveService');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.persistence.LocalStorageNamespace');
goog.require('audioCat.persistence.keys.UserData');
goog.require('audioCat.service.EventType');
goog.require('audioCat.service.Service');
goog.require('audioCat.service.ServiceId');
goog.require('audioCat.state.command.Event');
goog.require('audioCat.state.command.ImportAudioCommand');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.message.MessageType');
goog.require('audioCat.ui.widget.LoadingWidget');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.json');
goog.require('goog.string');


/**
 * Integrates with Google Drive.
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
 * @extends {audioCat.service.Service}
 */
audioCat.service.GoogleDriveService = function(
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
  goog.base(this,
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
      audioCat.service.ServiceId.GOOGLE_DRIVE,
      'Google Drive');
  /**
   * The API key.
   * @private {string}
   */
  this.apiKey_ = '';

  /**
   * The Google Drive SDK client ID.
   * @private {string}
   */
  this.clientId_ = '';

  /**
   * The scopes to request.
   * @private {!Array.<string>}
   */
  this.scopesRequested_ = [];

  /**
   * The ID of the current Google Drive user if any. Not necessarily properly
   * initiated. Do not rely on this string.
   * @private {string}
   */
  this.userId_ = '';

  /**
   * The ID of the current open document if any.
   * @private {string}
   */
  this.openDocumentId_ = '';

  /**
   * The ID of the epoch upon either the last save or the beginning of this
   * this current work instance.
   * @private {audioCat.utility.Id}
   */
  this.lastSaveEpochId_ = commandManager.getCurrentEpochId();

  /**
   * Either the ID of the command that would be undone next or -1.
   * @private {audioCat.utility.Id}
   */
  this.idOfCommandToUndoNext_ = /** @type {audioCat.utility.Id} */ (-1);

  /**
   * Whether a save would be useful at this point.
   * @private {boolean}
   */
  this.saveWouldDoSomething_ = false;

  /**
   * @private {!audioCat.persistence.LocalStorageManager}
   */
  this.localStorageManager_ = localStorageManager;

  /**
   * @private {!audioCat.state.prefs.PrefManager}
   */
  this.prefManager_ = prefManager;

  // When command history changes, find out if a save would be useful.
  commandManager.listen(
      audioCat.state.command.Event.COMMAND_HISTORY_CHANGED,
      this.handleCommandHistoryChange_, false, this);
};
goog.inherits(audioCat.service.GoogleDriveService, audioCat.service.Service);

/**
 * Checks for whether the fact that a save would be useful at this point has
 * changed.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.handleCommandHistoryChange_ =
    function() {
  this.handlePossibleSaveNeededChange_();
};

/**
 * Handles a possible change in whether saving would be meaningful.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.handlePossibleSaveNeededChange_ =
    function() {
  var saveNeeded = this.determineIfSaveNeeded_();
  if (saveNeeded != this.saveWouldDoSomething_) {
    this.saveWouldDoSomething_ = saveNeeded;
    this.dispatchEvent(audioCat.service.EventType.SHOULD_SAVE_STATE_CHANGED);
  }
};

/**
 * Determines if a save would do anything at this point.
 * @return {boolean} Whether a save would be meaningful due to pending changes.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.determineIfSaveNeeded_ =
    function() {
  var previousCommand = this.commandManager.getNextCommandToUndo();
  // A save's helpful if either the previous command differs or, we have reached
  // a different epoch.
  return (this.idOfCommandToUndoNext_ !=
      (previousCommand ?
          previousCommand.getId() : /** @type {audioCat.utility.Id} */ (-1))) ||
      (this.lastSaveEpochId_ != this.commandManager.getCurrentEpochId());
};

/**
 * Marks the current command epoch and next command to undo as the previous
 * point at which we saved.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.markSavedPoint_ = function() {
  var previousCommand = this.commandManager.getNextCommandToUndo();
  // A save's helpful if either the previous command differs or, we have reached
  // a different epoch.
  this.idOfCommandToUndoNext_ = previousCommand ?
      previousCommand.getId() : /** @type {audioCat.utility.Id} */ (-1);
  this.lastSaveEpochId_ = this.commandManager.getCurrentEpochId();
  this.handlePossibleSaveNeededChange_();
  this.dispatchEvent(audioCat.service.EventType.SHOULD_SAVE_STATE_CHANGED);
};

/** @override */
audioCat.service.GoogleDriveService.prototype.getSaveNeeded = function() {
  return this.saveWouldDoSomething_;
};

/** @override */
audioCat.service.GoogleDriveService.prototype.isRelevant = function() {
  // TODO(chizeng): Find a better criteria than whether state is in the URL.
  return goog.global.location.href.search(/[\?&]state=.+/) != -1 ||
      goog.global.location.href.search(/[\?&]google-drive-action=.+/) != -1;
};

/** @override */
audioCat.service.GoogleDriveService.prototype.takeAppropriateAction = function(
    actionManager) {
  var self = this;
  this.tryToAuthorize(function() {
    var loadingDriveContent = self.domHelper.createDiv();
    self.domHelper.setTextContent(loadingDriveContent, 'Loading scripts from ' +
        self.getServiceName() + ' ...');
    var loadingDriveDialog =
        self.dialogManager.obtainDialog(loadingDriveContent);
    self.dialogManager.showDialog(loadingDriveDialog);
    gapi.client.load('drive', 'v2', function() {
      self.dialogManager.hideDialog(loadingDriveDialog);
      self.takeAppropriateActionForReal_(actionManager);
    });
  });
};

/**
 * Takes appropriate action assuming that Google Drive is relevant and that the
 * API scripts have loaded.
 * @param {!audioCat.action.ActionManager} actionManager Manages all actions.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.takeAppropriateActionForReal_ =
    function(actionManager) {
  var url = goog.global.location.href;
  var getSeparatorIndex = url.indexOf('?');
  if (getSeparatorIndex == -1) {
    // No parameters found. Attempt to open app.
    this.tryToAuthorize();
    return;
  }
  var paramsFound = {};
  var getPortion = url.substring(getSeparatorIndex + 1);
  var args = getPortion.split('&');
  for (var i = 0; i < args.length; ++i) {
    var pieces = args[i].split('=');
    if (pieces.length == 2) {
      paramsFound[pieces[0]] = pieces[1];
    }
  }
  var stateValue = paramsFound['state'];
  var codeValue = paramsFound['code'];
  if (codeValue) {
    var unescapedCodeValue = goog.global.unescape(codeValue);
  }
  var googleDriveAction = paramsFound['google-drive-action'];
  if (stateValue || googleDriveAction) {
    var unescapedState = stateValue ?
        goog.global.unescape(stateValue) : undefined;
    var stateObject = unescapedState ?
        goog.json.parse(unescapedState) : {};
    this.userId_ = stateObject['userId'] || '';
    var documentIds = stateObject['ids'];
    if (documentIds && documentIds.length) {
      this.setOpenDocumentId_('' + documentIds[0]);
    }
    var folderId = stateObject['folderId'] || 'root';
    var action = stateObject['action'] || googleDriveAction;
    switch (action) {
      case 'create':
        goog.asserts.assert(folderId);
        this.createNewDocument_(actionManager, folderId);
        break;
      case 'open':
        this.openDocument_(actionManager, folderId);
        break;
    }
  }
};

/**
 * Computes the name of a new file.
 * @param {string=} opt_extensionlessfileName The file name without the
 *     extension for an audio project.
 * @return {string} The name of the saved file including the extension.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.computeFileName_ = function(
    opt_extensionlessfileName) {
  // Here, we compute a file name.
  return (opt_extensionlessfileName ?
          opt_extensionlessfileName : this.project.getTitle()) + '.' +
      audioCat.state.plan.Constant.PROJECT_EXTENSION;
};

/**
 * Creates a new document. Assumes that the Drive SDK has loaded.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {string} folderId The ID of the folder to create the document in.
 * @param {string=} opt_extensionlessFileName Optional initial file name
 *     without the audio project extension added.
 * @param {!Function=} opt_doneCallback Optional callback called when the new
 *     project document has been created. Called with this Google Drive service
 *     as the execution context.
 * @param {!Function=} opt_closeDialogCallback Optional callback called when the
 *     project document has been created AND the subsequent dialog of
 *     instructions to the user has been closed.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.createNewDocument_ = function(
    actionManager,
    folderId,
    opt_extensionlessFileName,
    opt_doneCallback,
    opt_closeDialogCallback) {
  // Here, we create a new document.
  var projectFileName = this.computeFileName_(opt_extensionlessFileName);
  var dialogContent = this.domHelper.createDiv();
  this.domHelper.setTextContent(
      dialogContent, 'Creating new audio project in ' + this.getServiceName() +
      ' ...');
  var creatingNewDocumentDialog =
      this.dialogManager.obtainDialog(dialogContent);
  this.dialogManager.showDialog(creatingNewDocumentDialog);
  var insertRequest = gapi.client.drive.files.insert({
    'resource': {
      'mimeType': audioCat.state.plan.Constant.PROJECT_MIME_TYPE,
      'parents': [folderId],
      'title': projectFileName
    }
  });
  insertRequest.execute(goog.bind(function(result) {
    this.setOpenDocumentId_(result.id);
    this.dialogManager.hideDialog(creatingNewDocumentDialog);
    var messageParagraph =
        this.domHelper.createDiv(goog.getCssName('innerParagraphContent'));
    var message = 'Created new project <b>' + projectFileName +
        '</b> in ' + this.getServiceName() + '. Save after making ' +
        'changes to update the project in ' + this.getServiceName() +
        ' by clicking the button that looks like this.';
    this.domHelper.setRawInnerHtml(messageParagraph, message);
    var buttonPictureParagraph =
        this.domHelper.createDiv(goog.getCssName('innerParagraphContent'));
    goog.dom.classes.add(
        buttonPictureParagraph, goog.getCssName('pictureParagraph'));
    var iconImage = this.domHelper.createElement('img');
    iconImage.src = 'images/' + this.getSaveIconImage();
    goog.dom.classes.add(iconImage, goog.getCssName('iconExample'));
    this.domHelper.appendChild(buttonPictureParagraph, iconImage);

    var messageParagraph2 =
        this.domHelper.createDiv(goog.getCssName('innerParagraphContent'));
    this.domHelper.setTextContent(messageParagraph2,
        'The button will be disabled if there are no changes to save.');

    var messageDialogContent =
        this.domHelper.createDiv(goog.getCssName('topBufferedDialog'));
    var innerContent =
        this.domHelper.createDiv(goog.getCssName('innerContentWrapper'));

    this.domHelper.appendChild(innerContent, messageParagraph);
    this.domHelper.appendChild(innerContent, buttonPictureParagraph);
    this.domHelper.appendChild(innerContent, messageParagraph2);

    this.domHelper.appendChild(messageDialogContent, innerContent);
    var messageDialog = this.dialogManager.obtainDialog(
        messageDialogContent, audioCat.ui.dialog.DialogText.GOT_IT);
    this.dialogManager.showDialog(messageDialog);

    // Here, we are done creating a new audio project document.
    if (opt_doneCallback) {
      opt_doneCallback.call(this);
    }

    // Remember the email in local storage.
    this.snatchEmailFromResponse_(result);
  }, this));
};

/**
 * @return {string} An access token. This actually just passively gets the
 *     access token. It does not create it.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.createAccessToken_ = function() {
  return gapi.auth.getToken().access_token;
};

/**
 * Creates a Google Drive API-related request.
 * @param {string} method The method of the request. Get or post.
 * @param {string} url The URL of the request.
 * @param {string} accessToken The access token for Drive.
 * @param {string=} opt_responseType The format of the response. Defaults to a
 *     DOM string.
 * @return {!XMLHttpRequest} A request to the Google Drive API. Includes the API
 *     token as a header.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.createDriveRequest_ = function(
    method, url, accessToken, opt_responseType) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.responseType = opt_responseType || '';
  return xhr;
};

/**
 * Sends a request to revoke a token.
 * @param {string} token The token to revoke.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.sendRevokeTokenRequest_ =
    function(token) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST',
      'https://accounts.google.com/o/oauth2/revoke?token=' + token, true);
  xhr.send();
};

/**
 * Opens the current document. Assumes that the Drive SDK has loaded.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {string} folderId The ID of the folder. May be erroneously root.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.openDocument_ = function(
    actionManager, folderId) {
  var self = this;
  // goog.asserts.assert(this.userId_.length);
  goog.asserts.assert(this.openDocumentId_.length);
  var dialogManager = this.dialogManager;
  var domHelper = this.domHelper;
  var eventHandler = new goog.events.EventHandler(this);
  var request = gapi.client.drive.files.get({
    'fileId': this.openDocumentId_
  });
  var showFailureDialog = function(errorMessage) {
    var failureDialog = dialogManager.obtainDialog(
        errorMessage, audioCat.ui.dialog.DialogText.CLOSE);
    dialogManager.showDialog(failureDialog);
  };
  request.execute(goog.bind(function(resp) {
    if (resp.downloadUrl) {
      var xhr = this.createDriveRequest_(
          'GET', resp.downloadUrl, this.createAccessToken_(), 'arraybuffer');
      var loadingContent = domHelper.createDiv(
          goog.getCssName('loadingDialog'));
      var loadingParagraph =
          domHelper.createDiv(goog.getCssName('innerParagraphContent'));
      var fileSize = goog.string.toNumber(resp.fileSize);
      domHelper.setRawInnerHtml(loadingParagraph, 'Retrieving <b>' +
          resp.title + '</b> (' + (fileSize / 1e6).toFixed(1) + ' MB) from ' +
          this.getServiceName() + ' ...');
      domHelper.appendChild(loadingContent, loadingParagraph);
      var loadingWidget = new audioCat.ui.widget.LoadingWidget(domHelper);
      var loadingWidgetContainer = domHelper.createDiv(
          goog.getCssName('loadingWidgetContainer'));
      domHelper.appendChild(loadingWidgetContainer, loadingWidget.getDom());
      domHelper.appendChild(loadingContent, loadingWidgetContainer);
      var loadingDialog = dialogManager.obtainDialog(loadingContent);
      var handleProgress = function(event) {
        event = /** @type {!ProgressEvent} */ (event);
        loadingWidget.setProgress(event.loaded / fileSize);
      };
      var cleanUpAfterLoadingStatus = function() {
        xhr.removeEventListener('progress', handleProgress);
        dialogManager.hideDialog(loadingDialog);
      };
      loadingDialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN,
          loadingWidget.cleanUp, false, loadingWidget);
      dialogManager.showDialog(loadingDialog);
      eventHandler.listen(xhr, 'load', goog.bind(function() {
        // Grab the file data.
        var fileData = /** @type {!ArrayBuffer} */ (xhr.response);

        // TODO(chizeng): Check for success of request? :/

        // Here, we know the mime type for the file that just opened.
        if (resp.mimeType.search(/^audio\/.*|.*google-apps\.audio$/) != -1) {
          // The user opened an audio file, the data for which has now loaded.
          var stillParsingAudioDialog;
          var decodingDone = false;
          var closeNewDocInstructionsDialogCallback = function() {
            // See if we need to tell the user that we're still parsing audio.
            if (!decodingDone) {
              stillParsingAudioDialog = dialogManager.obtainDialog(
                  'Parsing audio from <b>' + resp.title + '</b> ...');
              dialogManager.showDialog(stillParsingAudioDialog);
            }
          };

          // Create a new project for editing the audio file.
          var projectName =
              'TODO: Make \'' + resp.title + '\'' + ' more beautiful.';
          this.createNewDocument_(actionManager, folderId, projectName,
              undefined, closeNewDocInstructionsDialogCallback);
          this.project.setTitle(projectName);

          var doneDecodingCallback = goog.bind(function(audioBuffer) {
            // TODO(chizeng): Don't erroneously assume that the audio buffer
            // will always be non-null. Maybe file type is invalid. Or file is
            // too big. Handle errors gracefully. Have a little message
            // display in the dialog.
            audioBuffer = /** @type {!AudioBuffer} */ (audioBuffer);
            var audioChest = new audioCat.audio.AudioChest(
                audioBuffer,
                resp.title,
                audioCat.audio.AudioOrigination.IMPORTED,
                this.idGenerator);
            this.commandManager.enqueueCommand(
                new audioCat.state.command.ImportAudioCommand(
                    this.idGenerator,
                    resp.title,
                    audioChest));
            decodingDone = true;
            if (stillParsingAudioDialog) {
              // Close the dialog that says we're still parsing audio.
              dialogManager.hideDialog(stillParsingAudioDialog);
            }
          }, this);

          var errorDecodingCallback = function() {
            // Raise a new dialog notifying the user of how import failed.
            var errorMessage = /** @type {!Element} */ (soy.renderAsFragment(
                audioCat.action.templates.ImportFailedMessage));
            var errorImportingFileDialog =
                dialogManager.obtainDialog(
                    errorMessage, audioCat.ui.dialog.DialogText.CLOSE);
            dialogManager.showDialog(errorImportingFileDialog);
          };

          // Start the audio rendering.
          this.audioContextManager.createAudioBuffer(
              fileData, doneDecodingCallback, errorDecodingCallback);

          // Hide the loading data dialog once we have all file data.
          cleanUpAfterLoadingStatus();
        } else {
          // The audio project file we opened has loaded. We have its data.
          var actuateStateAction =
              /** @type {!audioCat.action.encode.ActuateProjectStateAction} */ (
              actionManager.retrieveAction(
                  audioCat.action.ActionType.ACTUATE_PROJECT_STATE));
          actuateStateAction.setFileName(resp.title);
          cleanUpAfterLoadingStatus();
          actuateStateAction.setEncoding(fileData);
          this.statePlanManager.listenOnce(audioCat.state.events.DECODING_ENDED,
              /** @param {!audioCat.state.DecodingEndedEvent} e */
              function(e) {
                if (e.getError().length == 0) {
                  // If success, mark this as a saved event.
                  this.markSavedPoint_();
                }
              }, false, this);
          actuateStateAction.doAction();
        }
      }, this));
      eventHandler.listen(xhr, 'error', function() {
        cleanUpAfterLoadingStatus();
        eventHandler.dispose();
        showFailureDialog('File could not be fetched across the network.');
      });
      xhr.addEventListener('progress', handleProgress);
      xhr.send();

      // Remember the email in local storage.
      this.snatchEmailFromResponse_(resp);
    } else {
      showFailureDialog('File could not be accessed.');
    }
  }, this));
};

/** @override */
audioCat.service.GoogleDriveService.prototype.tryToInstall = function(
    opt_successCallback,
    opt_failureCallback) {
  var handleAuthResult = goog.bind(function(authResult) {
      this.dialogManager.hideDialog(authorizingDialog);
      if (authResult && !authResult.error) {
        // Authorization successful.

        // TODO(chizeng): Find out if you have to revoke the access token. It
        // doesn't seem like it, but it may remove the Offline Access request
        // per opening of an audio project.
        //
        // var accessToken = authResult.access_token;
        // if (accessToken) {
        //   // Remove the access token to prevent an offline access request
        //   // every time the user opens a file.
        //   this.sendRevokeTokenRequest_(accessToken);
        // }

        if (opt_successCallback) {
          opt_successCallback(authResult);
        }
      } else {
        // Authorization failed ... Or the user has not signed in and installed.
        if (opt_failureCallback) {
          var noInstallContent =
              this.domHelper.createDiv(goog.getCssName('topBufferedDialog'));
          var innerContent =
              this.domHelper.createDiv(goog.getCssName('innerContentWrapper'));
          this.domHelper.setTextContent(innerContent,
              'You opted to not integrate with ' + this.getServiceName() +
              ', so you will not be able to save and load projects from ' +
              this.getServiceName() + '. You can still save and load ' +
              '.audioproject files stored on your computer though.');
          this.domHelper.appendChild(noInstallContent, innerContent);
          var noInstallDialog = this.dialogManager.obtainDialog(
              noInstallContent, audioCat.ui.dialog.DialogText.CLOSE);
          this.dialogManager.showDialog(noInstallDialog);
          opt_failureCallback(authResult);
        }
      }
      // Clear the settings to remove them from memory.
      this.clearSettings_();
    }, this);
  // Attempt to authorize.
  var authorizingDialog;
  var authorizeButton = this.dialogManager.obtainButton(
      'Authorize Beautiful to use ' + this.getServiceName() + '.');
  var self = this;
  var actuallyAttemptToAuthorize = function() {
    self.dialogManager.putBackButton(authorizeButton);
    self.dialogManager.hideDialog(authorizingDialog);
    gapi.auth.init(function() {
      self.initializeSettings_();
      gapi.client.setApiKey(self.apiKey_);
      gapi.auth.authorize({
          'access_type': 'online',
          'approval_prompt': 'auto',
          'client_id': self.clientId_,
          'scope': self.scopesRequested_,
          'immediate': false
        }, handleAuthResult);
    });
  };

  var authDialogContent =
      this.domHelper.createDiv(goog.getCssName('topBufferedDialog'));
  var authInnerContent =
      this.domHelper.createDiv(goog.getCssName('innerContentWrapper'));
  authorizeButton.performOnUpPress(actuallyAttemptToAuthorize);
  this.domHelper.appendChild(authInnerContent, authorizeButton.getDom());
  this.domHelper.appendChild(authDialogContent, authInnerContent);
  authorizingDialog = this.dialogManager.obtainDialog(
      authDialogContent, audioCat.ui.dialog.DialogText.CANCEL);
  this.dialogManager.showDialog(authorizingDialog);
};

/** @override */
audioCat.service.GoogleDriveService.prototype.tryToAuthorize = function(
    opt_successCallback,
    opt_failureCallback) {
  var self = this;
  var authDialogContent = this.domHelper.createDiv();
  this.domHelper.setTextContent(
      authDialogContent, 'Integrating with ' + this.getServiceName() + ' ...');
  var authorizingDialog = this.dialogManager.obtainDialog(authDialogContent);
  var loadFunctionGlobalName = 'sL' + this.getServiceId();
  goog.global[loadFunctionGlobalName] = goog.bind(function() {
    // Delete the method from the global scope immediately.
    delete goog.global[loadFunctionGlobalName];
    this.dialogManager.hideDialog(authorizingDialog);
    var handleAuthResult = goog.bind(function(authResult) {
      if (authResult && !authResult.error) {
        // Authorization successful.
        if (opt_successCallback) {
          opt_successCallback(authResult);
        }
      } else {
        // Authorization failed ... Or the user has not signed in and installed.
        this.tryToInstall(opt_successCallback, opt_failureCallback);
      }
      // Clear the settings to remove them from memory.
      this.clearSettings_();
    }, this);

    // Attempt to authorize.
    // This call is needed to unblock the popup.
    gapi.auth.init(function() {
      self.initializeSettings_();
      gapi.client.setApiKey(self.apiKey_);
      gapi.auth.authorize({
          'access_type': 'online',
          'approval_prompt': 'auto',
          'client_id': self.clientId_,
          'scope': self.scopesRequested_,
          'immediate': false
        }, handleAuthResult);
    });
  }, this);
  this.dialogManager.showDialog(authorizingDialog);
  this.callAfterDriveScriptLoaded_(loadFunctionGlobalName);
};

/**
 * Calls a function after the Google Drive API scripts have loaded. Or ... if
 * those scripts have already loaded, just calls the method.
 * @param {string} callbackGlobalName The global name of the callback. Must be
 *     a currently defined method.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.callAfterDriveScriptLoaded_ =
    function(callbackGlobalName) {
  var callback = goog.global[callbackGlobalName];
  goog.asserts.assert(callback);
  if (goog.global['gapi']) {
    // Drive scripts loaded already.
    callback();
  } else {
    var domHelper = this.domHelper;
    var scriptTag = domHelper.createJavascriptTag(
        'https://apis.google.com/js/client.js?onload=' + callbackGlobalName);
    domHelper.appendChild(domHelper.getDocument().body, scriptTag);
  }
};

/**
 * Initializes Google Drive settings for the app. We may not need them.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.initializeSettings_ = function() {
  this.apiKey_ = 'AIzaSyA0rsEwVimHQtru8m3qMD3el_Juul9BuWM';
  this.clientId_ = '387438084475-09dtuc4ptsrke5pc2vc469v0tag92aoc.' +
      'apps.googleusercontent.com';
  this.scopesRequested_ = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.install'
    ];
};

/**
 * Clears Google Drive settings for the app. We may not need them.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.clearSettings_ = function() {
  this.apiKey_ = '';
  this.clientId_ = '';
  this.scopesRequested_ = [];
};

/** @override */
audioCat.service.GoogleDriveService.prototype.getSaveIconImage = function() {
  return 'saveToGoogleDrive.svg';
};

/**
 * Sets the ID of the open document, and notifies other entities if there is
 * a difference in that.
 * @param {string} documentId The ID of the document to open. Could be empty for
 *     setting to no document at all.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.setOpenDocumentId_ =
    function(documentId) {
  var oldOpenDocumentId = this.openDocumentId_;
  if (oldOpenDocumentId != documentId) {
    this.openDocumentId_ = documentId;
    this.dispatchEvent(audioCat.service.EventType.OPEN_DOCUMENT_CHANGED);
  }
};

/** @override */
audioCat.service.GoogleDriveService.prototype.getOpenDocumentDescriptor =
    function() {
  return this.openDocumentId_;
};

/** @override */
audioCat.service.GoogleDriveService.prototype.saveContent = function() {
  // Create a dialog that describes that we're saving the right project.
  var domHelper = this.domHelper;
  var dialogContent = domHelper.createDiv(goog.getCssName('topBufferedDialog'));
  var innerContent =
      domHelper.createDiv(goog.getCssName('innerContentWrapper'));
  domHelper.appendChild(dialogContent, innerContent);
  var savingToGoogleDriveMessage =
      domHelper.createDiv(goog.getCssName('innerParagraphContent'));
  var fileName = this.computeFileName_();
  domHelper.setRawInnerHtml(savingToGoogleDriveMessage,
      'Saving <b>' + fileName + '</b> to ' + this.getServiceName() +
      '. Closing this dialog will cancel saving.');
  domHelper.appendChild(innerContent, savingToGoogleDriveMessage);
  var statusContainer =
      domHelper.createDiv(goog.getCssName('innerParagraphContent'));
  var updateStatus = function(status) {
    domHelper.setRawInnerHtml(statusContainer, status + ' ...');
  };
  updateStatus('Saving project title and encoding project');
  domHelper.appendChild(innerContent, statusContainer);
  var progressAfterEncoding = 0.05;
  var progressForSending = 1 - progressAfterEncoding;
  var loadingWidget = new audioCat.ui.widget.LoadingWidget(domHelper);
  var loadingWidgetContainer =
      domHelper.createDiv(goog.getCssName('uploadProgressIndicator'));
  domHelper.appendChild(loadingWidgetContainer, loadingWidget.getDom());
  domHelper.appendChild(innerContent, loadingWidgetContainer);

  // Show the dialog. Be sure to clean up when the dialog closes.
  var dialog = this.dialogManager.obtainDialog(
      dialogContent, audioCat.ui.dialog.DialogText.CANCEL);
  var outstandingTimeouts = [];
  var outstandingRequests = [];
  var eventHandler = new goog.events.EventHandler(this);
  dialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
      eventHandler.dispose();
      loadingWidget.cleanUp();
      for (var i = 0; i < outstandingTimeouts.length; ++i) {
        goog.global.clearTimeout(outstandingTimeouts[i]);
      }
      for (var i = 0; i < outstandingRequests.length; ++i) {
        outstandingRequests[i].abort();
      }
      outstandingRequests.length = 0;
    }, false, this);
  this.dialogManager.showDialog(dialog);

  var resumableUploadUrl;
  var nextDelayInSeconds = 1;
  var encoding;
  var numberOfContentRequestsTried = 0;
  // The byte with index 1 less than this has been uploaded.
  var upperUploadedByteBound = 0;

  // The warning to issue when requests repeatedly fail.
  var repeatFailWarning =
      '<br>If connecting repeatedly fails, hit cancel, then save ' +
      'the whole project as a local file (via the File menu) ' +
      'to load into the editor later.';

  // Issue request to change metadata.
  var sendMainContent = goog.bind(function() {
    // Send the main content over in a series of resumable requests.
    goog.asserts.assert(resumableUploadUrl);
    var requestMainContent = goog.bind(function() {
      eventHandler.removeAll();
      var status = 'Saving project data (' + (encoding.size / 1e6).toFixed(1) +
          ' MB total)';
      if (numberOfContentRequestsTried > 0) {
        status += ' ... attempt ' + (numberOfContentRequestsTried + 1);
      }
      updateStatus(status);
      var xhr = this.createDriveRequest_(
          'PUT', resumableUploadUrl, this.createAccessToken_());
      xhr.setRequestHeader('Content-Range', 'bytes ' + upperUploadedByteBound +
          '-' + (encoding.size - 1) + '/' + encoding.size);
      eventHandler.listen(xhr.upload, 'progress', function(e) {
        var rawEvent = /** @type {!ProgressEvent} */ (e.getBrowserEvent());
        loadingWidget.setProgress(progressAfterEncoding + progressForSending *
            (upperUploadedByteBound + rawEvent.loaded * (
                encoding.size - upperUploadedByteBound) / rawEvent.total) /
                    encoding.size);
      }, false);
      eventHandler.listen(xhr, 'loadend', function() {
          goog.array.remove(outstandingRequests, xhr);
          ++numberOfContentRequestsTried;
          var retryDelay =
              Math.pow(2, Math.floor(numberOfContentRequestsTried / 3));
          var shouldRetry = false;
          if (xhr.status == 404) {
            // Repeat the whole request.
            upperUploadedByteBound = 0;
            updateStatus(
                'Trouble connecting, will retry the whole request in ' +
                retryDelay + ' seconds.' + repeatFailWarning);
            shouldRetry = true;
          } else if (xhr.status >= 500 && xhr.status < 600 ||
              xhr.status >= 300 && xhr.status < 400) {
            // 3XX or 5XX server error. Resume upload from where we left off.
            var rangeHeader = xhr.getResponseHeader('Range');
            if (rangeHeader) {
              var rangeArray = rangeHeader.split('-');
              if (rangeArray.length == 2) {
                upperUploadedByteBound = goog.string.toNumber(rangeArray[1]);
                updateStatus(
                    'Request interrupted, will try to resume in ' +
                    retryDelay.toFixed(0) + ' seconds.' + repeatFailWarning);
                shouldRetry = true;
              }
            }
          } else if (xhr.status >= 200 && xhr.status < 300) {
            // Saving succeeded. Close dialog. Issue success message.
            this.markSavedPoint_();
            this.dialogManager.hideDialog(dialog);
            this.messageManager.issueMessage('Successfully saved <b>' +
                fileName + '</b> to ' + this.getServiceName(),
                audioCat.ui.message.MessageType.SUCCESS);
            return;
          }
          if (shouldRetry) {
            // Make another attempt or resume.
            var timeoutId = goog.global.setTimeout(function() {
              goog.array.remove(outstandingTimeouts, timeoutId);
              requestMainContent();
            }, retryDelay * 1000);
            outstandingTimeouts.push(timeoutId);
          } else {
            // Close dialog, show error dialog indicating that request could not
            // be saved.
            this.dialogManager.hideDialog(dialog);
            this.displayErrorDialog_(
                'Saving to ' + this.getServiceName() + ' failed. To avoid ' +
                'losing data, download the project to a local .' +
                 audioCat.state.plan.Constant.PROJECT_EXTENSION + ' file on ' +
                 'your local computer to load into the editor later.');
          }
        }, false); // Closes a single XHR loadend.
        xhr.send((upperUploadedByteBound > 0) ?
          encoding.slice(upperUploadedByteBound) : encoding);
        outstandingRequests.push(xhr);
      }, this);
      requestMainContent();
    }, this);

  // Prepare for uploading the content.
  var thingsToBeDone = 0;
  var approachingSendingContent = function() {
    if (thingsToBeDone == 2) {
      // We are ready to send the content portion.
      eventHandler.removeAll();
      loadingWidget.setProgress(progressAfterEncoding);
      sendMainContent();
    }
  };

  var sendInitialRequest = goog.bind(function() {
    var xhr = this.createDriveRequest_('PUT', this.getDriveSdkBaseUrl_() +
        '/upload/drive/v2/files/' + this.openDocumentId_ +
        '?uploadType=resumable', this.createAccessToken_());
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.setRequestHeader('X-Upload-Content-Type',
        audioCat.state.plan.Constant.PROJECT_MIME_TYPE);

    // Send the initial request for a resumable upload. Listen for success or
    // failure ...
    var handleInitiateRequestError = function() {
      eventHandler.removeAll();
      updateStatus('Erroring sending the request. Retrying in ' +
          nextDelayInSeconds + ' seconds.' + repeatFailWarning);
      var recentTimeout = goog.global.setTimeout(function() {
        goog.array.remove(outstandingTimeouts, recentTimeout);
        updateStatus('Sending request to initiate upload');
        sendInitialRequest();
      }, nextDelayInSeconds * 1000);
      outstandingTimeouts.push(recentTimeout);
      nextDelayInSeconds += nextDelayInSeconds;
    };
    eventHandler.listen(xhr, 'load', function() {
      goog.array.remove(outstandingRequests, xhr);
      resumableUploadUrl = xhr.getResponseHeader('location');
      if (resumableUploadUrl) {
        ++thingsToBeDone;
        approachingSendingContent();
      } else {
        // TODO(chizeng): Instead of repeating the request, indicate that the
        // file could not be found.
        handleInitiateRequestError();
      }
    });
    eventHandler.listen(xhr, 'error', function() {
      goog.array.remove(outstandingRequests, xhr);
      handleInitiateRequestError();
    });
    xhr.send(goog.json.serialize({
        'title': fileName
      }));
    outstandingRequests.push(xhr);
  }, this);
  sendInitialRequest();

  // Start encoding the project.
  encoding = this.statePlanManager.produceEncoding();
  ++thingsToBeDone;
  approachingSendingContent();

  // When both are done ...
  // While we are not done ... keep issuing requests ... at a certain delay.
  // If we are 100% done
      // Tell the service of the new next job to be undone and epoch.
      // Close dialog, issue message.

  // When the dialog closes, cancel any set timeouts and xhrs.
  // Also clean up the progress widget.
};

/**
 * @return {string} The base URL of the Drive SDK access point. Omits the slash
 *     at the end.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.getDriveSdkBaseUrl_ = function() {
  return 'https://www.googleapis.com';
};

/**
 * Displays a failure message in an dialog box that has the user 'acknowledge'.
 * @param {string} message The message that could contain HTML to set the dialog
 *     message.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.displayErrorDialog_ = function(
    message) {
  var domHelper = this.domHelper;
  var failDialogContent =
     domHelper.createDiv(goog.getCssName('topBufferedDialog'));
  var failInnerContent =
      domHelper.createDiv(goog.getCssName('innerContentWrapper'));
  domHelper.setRawInnerHtml(failInnerContent, message);
  domHelper.appendChild(failDialogContent, failInnerContent);
  var failureDialog = this.dialogManager.obtainDialog(
      failDialogContent, audioCat.ui.dialog.DialogText.ACKNOWLEDGED);
  this.dialogManager.showDialog(failureDialog);
};

/**
 * Sets the email address in local storage for use when say the user would like
 * to purchase mp3 exporting.
 * @param {string} email The email to store in local storage.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.storeEmailInLocalStorage_ =
    function(email) {
  this.localStorageManager_.setForNamespace(
      audioCat.persistence.LocalStorageNamespace.USER_DATA,
      audioCat.persistence.keys.UserData.EMAIL,
      email);
};

/**
 * Obtains the email from a Drive file response. Also queries for whether the
 * user had enabled mp3 exporting.
 * @param {!GoogleDriveFile} resp A file parameter object.
 * @private
 */
audioCat.service.GoogleDriveService.prototype.snatchEmailFromResponse_ =
    function(resp) {
  var owners = resp.owners;
  for (var i = 0; i < owners.length; ++i) {
    if (owners[i] && owners[i].isAuthenticatedUser) {
      var email = owners[i].emailAddress;
      if (!this.prefManager_.getMp3ExportingEnabled()) {
        var sendRequestToCheckForMp3 = goog.bind(function() {
          // Issue request to see if the user enabled MP3 export.
          var checkMp3Request = new XMLHttpRequest();
          checkMp3Request.open('GET', '/xsfd?e=' + email, true);
          checkMp3Request.onload = goog.bind(function() {
            var value = checkMp3Request.responseText.trim();
            if (value == '1') {
              this.prefManager_.setMp3ExportingEnabled(true);
            }
          }, this);
          checkMp3Request.onerror = function() {
            // Try again after 5 seconds if the first request failed.
            goog.global.setTimeout(sendRequestToCheckForMp3, 5000);
          };
          checkMp3Request.send();
        }, this);

        // Start by sending the first request.
        sendRequestToCheckForMp3();
      }
      this.storeEmailInLocalStorage_(email);
      return;
    }
  }
};

/**
 * @return {string} The API key for Google.
 */
audioCat.service.GoogleDriveService.prototype.getApiKey = function() {
  if (!this.apiKey_) {
    this.initializeSettings_();
  }
  return this.apiKey_;
};

/**
 * @return {string} The client ID for Google.
 */
audioCat.service.GoogleDriveService.prototype.getClientId = function() {
  if (!this.clientId_) {
    this.initializeSettings_();
  }
  return this.clientId_;
};

/**
 * @return {!Array.<string>} The list of scopes for Drive files in general.
 */
audioCat.service.GoogleDriveService.prototype.getFileScopeList = function() {
  return ['https://www.googleapis.com/auth/drive'];
};
