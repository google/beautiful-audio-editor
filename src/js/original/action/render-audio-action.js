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
goog.provide('audioCat.action.RenderAudioAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.audio.render.ExceptionType');
goog.require('audioCat.ui.dialog.DialogText');


/**
 * Renders the audio of the project into an audio buffer. Throws 1 if the action
 * was unsuccessful, and a dialog was shown by this action.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.RenderAudioAction = function(
    domHelper,
    dialogManager,
    audioRenderer) {

  /**
   * Manages DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * Renders audio into a buffer.
   * @private {!audioCat.audio.render.AudioRenderer}
   */
  this.audioRenderer_ = audioRenderer;

  goog.base(this);
};
goog.inherits(audioCat.action.RenderAudioAction, audioCat.action.Action);

/** @override */
audioCat.action.RenderAudioAction.prototype.doAction = function() {
  try {
    this.audioRenderer_.renderAudioGraph();
  } catch (error) {
    // An error prevented us from rendering.
    var message = 'Could not render. ';
    var category;
    switch (error) {
      case audioCat.audio.render.ExceptionType.NO_TRACKS_TO_RENDER:
        message += 'No tracks to render.';
        category = 1;
        break;
      case audioCat.audio.render.ExceptionType.TRACK_SILENT:
        message += 'Your track lacks sound.';
        category = 2;
        break;
      case audioCat.audio.render.ExceptionType.TRACKS_SILENT:
        message += 'Your tracks lack sound.';
        category = 3;
        break;
      default:
        message += String(error);
        category = 4;
    }

    var memoryInfo;
    if (goog.global.performance && goog.global.performance.memory) {
      memoryInfo = goog.global.performance.memory;
    }

    // Log the error if it's not known.
    if (category == 4) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/renderError', true);
      xhr.setRequestHeader('error_message', String(error));
      xhr.setRequestHeader('case_category', '' + category);
      xhr.setRequestHeader('js_heap_size_limit',
          memoryInfo ? '' + memoryInfo.jsHeapSizeLimit : '-1');
      xhr.setRequestHeader('used_js_heap_size',
          memoryInfo ? '' + memoryInfo.usedJSHeapSize : '-1');
      xhr.setRequestHeader('total_js_heap_size',
          memoryInfo ? '' + memoryInfo.totalJSHeapSize : '-1');
      xhr.send();
    }

    var dialogManager = this.dialogManager_;

    // Obtain a cancelable dialog.
    var dialog = dialogManager.obtainDialog(
        message, audioCat.ui.dialog.DialogText.CLOSE);

    // Show the dialog with a background shield preventing interaction.
    dialogManager.showDialog(dialog);
    throw 1;
  }
};
