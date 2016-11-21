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
goog.provide('audioCat.ui.menu.item.ExportAsWavItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.audio.render.ExportFormat');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for importing a new track of audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages the
 *     exporting of audio.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.ExportAsWavItem = function(
    actionManager,
    exportManager) {
  /**
   * Instructions on exporting as a WAV.
   * @private {string}
   */
  this.exportInstructions_ = 'Export as WAV file.';

  /**
   * Text that is displayed when the item is disabled.
   * @private {string}
   */
  this.disabledItemText_ = 'Currently exporting WAV file ...';

  // Construct the item, and set the base content while we're at it.
  goog.base(this, this.exportInstructions_);

  /**
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  /**
   * Manages audio export.
   * @private {!audioCat.audio.render.ExportManager}
   */
  this.exportManager_ = exportManager;

  // Disable/enable the export item depending on whether export is occurring.
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_BEGAN,
      this.handleExportManagerStateChange_, false, this);
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_FAILED,
      this.handleExportManagerStateChange_, false, this);
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_SUCCEEDED,
      this.handleExportManagerStateChange_, false, this);

  // Respond to clicks.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(audioCat.ui.menu.item.ExportAsWavItem,
    audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.ExportAsWavItem.prototype.handleClick_ = function() {
  // TODO(chizeng): We probably want to give the user some options when it comes
  // to exporting.
  var exportAction = /** @type {!audioCat.action.render.ExportAction} */ (
      this.actionManager_.retrieveAction(audioCat.action.ActionType.EXPORT));
  exportAction.setExportFormat(audioCat.audio.render.ExportFormat.WAV);
  exportAction.doAction();
};

/**
 * Handles what happens when the exporting state (whether a current export is
 * occurring) changes. We only enable this item when no export is occuring.
 * @private
 */
audioCat.ui.menu.item.ExportAsWavItem.prototype.
    handleExportManagerStateChange_ = function() {
  var exportState = this.exportManager_.getExportingState(
      audioCat.audio.render.ExportFormat.WAV);
  if (exportState == this.isEnabled()) {
    // If the export state is already opposite of our enabled state ...
    // No need to do anything.

    // While we're exporting, the item should be disabled.
    this.setContent(exportState ?
        this.disabledItemText_ : this.exportInstructions_);
    this.setEnabled(!exportState);
  }
};
