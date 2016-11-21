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
goog.provide('audioCat.ui.tracks.widget.ImportAudioWidget');

goog.require('audioCat.ui.tracks.widget.TrackLeftBottomWidget');


/**
 * A widget for importing audio.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.RequestAudioImportAction} requestAudioImportAction
 *     An action that requests an import of audio.
 * @constructor
 * @extends {audioCat.ui.tracks.widget.TrackLeftBottomWidget}
 */
audioCat.ui.tracks.widget.ImportAudioWidget = function(
    domHelper,
    requestAudioImportAction) {
  /**
   * @private {!audioCat.action.RequestAudioImportAction}
   */
  this.requestAudioImportAction_ = requestAudioImportAction;

  goog.base(this, domHelper, '+ Import', 'Import audio file.');
};
goog.inherits(audioCat.ui.tracks.widget.ImportAudioWidget,
    audioCat.ui.tracks.widget.TrackLeftBottomWidget);

/** @override */
audioCat.ui.tracks.widget.ImportAudioWidget.prototype.handleUpPress =
    function() {
  this.requestAudioImportAction_.doAction();
};
