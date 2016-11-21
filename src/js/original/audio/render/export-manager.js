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
goog.provide('audioCat.audio.render.ExportManager');

goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.audio.render.ExportFormat');
goog.require('audioCat.audio.render.ExportFunction');
goog.require('audioCat.audio.render.ExportWorkerMessageType');
goog.require('audioCat.audio.render.ExportingBeganEvent');
goog.require('audioCat.audio.render.ExportingFailedEvent');
goog.require('audioCat.audio.render.ExportingProgressEvent');
goog.require('audioCat.audio.render.ExportingSucceededEvent');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.events');


/**
 * Manages audio exports into various formats. Only 1 export at a time can
 * happen.
 * @param {!audioCat.state.Project} project Stores project state.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio
 *     into an audio buffer.
 * @param {!audioCat.action.RenderAudioAction} renderAudioAction The action that
 *     renders the audio.
 * @param {!audioCat.utility.WebWorkerManager} webWorkerManager Creates and
 *     manages web workers.
 * @param {audioCat.android.AndroidAmbassador=} opt_androidAmbassador Modifies
 *     an object that's injected into javascript from Android java. Only defined
 *     if we are inside an Android web view.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.audio.render.ExportManager = function(
    project,
    domHelper,
    audioRenderer,
    renderAudioAction,
    webWorkerManager,
    opt_androidAmbassador) {
  goog.base(this);

  /**
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.audio.render.AudioRenderer}
   */
  this.audioRenderer_ = audioRenderer;

  /**
   * @private {!audioCat.action.RenderAudioAction}
   */
  this.renderAudioAction_ = renderAudioAction;

  /**
   * @private {!audioCat.utility.WebWorkerManager}
   */
  this.webWorkerManager_ = webWorkerManager;

  /**
   * A mapping from formats that are currently exporting to the number 1.
   * @private {!Object.<audioCat.audio.render.ExportFormat, number>}
   */
  this.exportingFormats_ = {};

  /**
   * A mapping from render IDs of rendering operations that are taking place to
   * the associated listener key for the rendering done event.
   * @private {!Object.<audioCat.utility.Id, goog.events.Key>}
   */
  this.renderIdToListenerKey_ = {};

  /**
   * Interfaces with Android java. Only defined if we are in an Android web
   * view.
   * @private {audioCat.android.AndroidAmbassador|undefined}
   */
  this.androidAmbassador_ = opt_androidAmbassador;
};
goog.inherits(
    audioCat.audio.render.ExportManager, audioCat.utility.EventTarget);

/**
 * Exports the project's current audio into a file. Does so on a separate thread
 * so the user can still interact with the UI. Triggers the download of the
 * generated file for the user.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 */
audioCat.audio.render.ExportManager.prototype.exportFile = function(format) {
  // TODO(chizeng): Let the user vary the output bit depth and thus make the
  // tradeoff between memory and quality.

  if (this.getExportingState(format)) {
    // The app should prevent the user from starting an export during an export.
    throw 1;
  }
  this.noteExportingBegan_(format);

  var audioRenderer = this.audioRenderer_;
  var webWorkerManager = this.webWorkerManager_;

  // Prepare to respond to the renderer being finished with rendering.
  var nextRenderId = audioRenderer.getNextRenderId();
  this.renderIdToListenerKey_[nextRenderId] =
      goog.events.listen(audioRenderer,
          audioCat.audio.render.EventType.AUDIO_RENDERED,
          goog.partial(this.handleRenderForExportDone_, nextRenderId, format),
          false, this);

  // Starts rendering audio. Throws an exception if the rendering was
  // incomplete.
  try {
    this.noteProgress_(format, 0.05);
    this.renderAudioAction_.doAction();
    this.noteProgress_(format, 0.1);
  } catch (err) {
    goog.events.unlistenByKey(this.renderIdToListenerKey_[nextRenderId]);
    delete this.renderIdToListenerKey_[nextRenderId];
    this.noteExportingFailed_(format);
  }
};

/**
 * Handles what happens when the final audio buffer finishes rendering for
 * exporting.
 * @param {audioCat.utility.Id} renderId The ID of the render operation.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {!audioCat.audio.render.AudioRenderedEvent} event The associated
 *     event.
 * @private
 */
audioCat.audio.render.ExportManager.prototype.handleRenderForExportDone_ =
    function(renderId, format, event) {
  if (renderId == event.getRenderId()) {
    // Remove the render listener.
    goog.events.unlistenByKey(this.renderIdToListenerKey_[renderId]);
    delete this.renderIdToListenerKey_[renderId];
  } else {
    // This listener is not relevant to this render operation.
    return;
  }

  var audioBuffer = event.getAudioBuffer();

  // Create a worker. Increment the count when adding a new argument.
  var webWorkerManager = this.webWorkerManager_;
  var worker = webWorkerManager.createWorkerFromFunction(
      audioCat.audio.render.ExportFunction[format], 5);

  // TODO(chizeng): Let the user vary the number of export channels. I think
  // we can just alter the OfflineAudioContext arguments.
  var numberOfChannels = audioBuffer.numberOfChannels;

  var channelData = [];
  for (var i = 0; i < numberOfChannels; ++i) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  var self = this;
  worker.onmessage = function(event) {
    switch (event.data[0]) {
      case audioCat.audio.render.ExportWorkerMessageType.DONE:
        // At this point, the worker has finished creating the file URL.
        // The data is a list containing the data URL, then file size in bytes.
        var fileUrl = event.data[1];
        var fileSizeInBytes = event.data[2];
        var fileDataArrayBuffer = event.data[3];

        var downloadedFileName = self.project_.getTitle() + '.';
        var extension;
        if (format == audioCat.audio.render.ExportFormat.MP3) {
          extension = 'mp3';
        } else if (format == audioCat.audio.render.ExportFormat.WAV) {
          extension = 'wav';
        }
        goog.asserts.assert(goog.isDef(extension));
        downloadedFileName += extension;

        // Mark that exporting is done.
        self.noteExportingSucceded_(
            format, downloadedFileName, fileUrl, fileSizeInBytes,
            fileDataArrayBuffer);
        break;
      case audioCat.audio.render.ExportWorkerMessageType.ERROR:
        var errorMessage = event.data[1];
        self.noteExportingFailed_(format, errorMessage);
        break;
      case audioCat.audio.render.ExportWorkerMessageType.PROGRESS:
        // Let initial rendering work take up an initial 10% of progress. The
        // exporting done in the worker accounts for 85% of progress. Another
        // 5% is taken up by any final operations.
        self.noteProgress_(format, 0.1 + 0.85 * event.data[1]);
        break;
      default:
        goog.asserts.fail('Unknown worker message fired.');
    }
  };

  // Post to the worker arguments for producing the blob.
  // TODO(chizeng): The 2 makes each output sample be 2 bytes. Let the user
  // vary this value to trade off between memory and quality.
  // The second argument lets us transfer instead of cloning objects.
  var backingBuffers = [];
  for (var i = 0; i < numberOfChannels; ++i) {
    backingBuffers.push(channelData[i].buffer);
  }
  worker.postMessage(
      [channelData, audioBuffer.sampleRate, 2, goog.global.location.href,
      !!this.androidAmbassador_],
      backingBuffers);
};

/**
 * Gets whether the current format is being rendered.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @return {boolean} Whether the manager is currently in the process of
 *     exporting. The user is not allowed to start an export in the middle of
 *     another export, lest an exception is thrown.
 */
audioCat.audio.render.ExportManager.prototype.getExportingState =
    function(format) {
  return !!this.exportingFormats_[format];
};

/**
 * Notes that exporting has begun and informs other entities with an event.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @private
 */
audioCat.audio.render.ExportManager.prototype.noteExportingBegan_ = function(
    format) {
  this.exportingFormats_[format] = 1;
  this.dispatchEvent(new audioCat.audio.render.ExportingBeganEvent(format));
};

/**
 * Notes that exporting has failed and informs other entities with an event.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {string=} opt_errorMessage The error message if any.
 * @private
 */
audioCat.audio.render.ExportManager.prototype.noteExportingFailed_ =
    function(format, opt_errorMessage) {
  delete this.exportingFormats_[format];
  this.dispatchEvent(
      new audioCat.audio.render.ExportingFailedEvent(format, opt_errorMessage));
};

/**
 * Notes that exporting has succeeded and informs other entities with an event.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {string} fileName Name of the exported file.
 * @param {string} url The download URL. This is an object URL iff we are not in
 *     web view. Otherwise, it is an empty string.
 * @param {number} fileSizeInBytes The size of the exported file in bytes.
 * @param {ArrayBuffer} fileDataArrayBuffer The data to be stored in the file.
 *     Null if not sent from the worker. Sent back for say Android java.
 * @private
 */
audioCat.audio.render.ExportManager.prototype.noteExportingSucceded_ = function(
    format, fileName, url, fileSizeInBytes, fileDataArrayBuffer) {
  delete this.exportingFormats_[format];
  this.dispatchEvent(new audioCat.audio.render.ExportingSucceededEvent(
      format, fileName, url, fileSizeInBytes, fileDataArrayBuffer));
};

/**
 * Notes that progress has been made for exporting into a certain format.
 * @param {audioCat.audio.render.ExportFormat} format The export format.
 * @param {number} progress A fraction out of 1 denoting how much progress has
 *     been made.
 * @private
 */
audioCat.audio.render.ExportManager.prototype.noteProgress_ = function(
    format,
    progress) {
  this.dispatchEvent(new audioCat.audio.render.ExportingProgressEvent(
      format, progress));
};
