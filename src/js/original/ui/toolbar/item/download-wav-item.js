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
goog.provide('audioCat.ui.toolbar.item.DownloadWavItem');

goog.require('audioCat.audio.render.ExportFormat');
goog.require('audioCat.ui.toolbar.item.DownloadExportItem');


/**
 * A toolbar item for downloading the project as a WAVE file.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.DownloadExportItem}
 */
audioCat.ui.toolbar.item.DownloadWavItem = function(
    domHelper,
    editModeManager,
    exportManager,
    actionManager,
    toolTip) {
  goog.base(
      this,
      audioCat.audio.render.ExportFormat.WAV,
      'downloadWav.svg',
      domHelper,
      editModeManager,
      exportManager,
      actionManager,
      toolTip);
};
goog.inherits(audioCat.ui.toolbar.item.DownloadWavItem,
    audioCat.ui.toolbar.item.DownloadExportItem);
