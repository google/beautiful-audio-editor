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
goog.provide('audioCat.ui.toolbar.item.DownloadExportItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('audioCat.ui.widget.LoadingWidget');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A toolbar item for downloading the project as a file of some format.
 * @param {audioCat.audio.render.ExportFormat} format The format to export into.
 * @param {string} iconFileName The name of the file for the icon. This excludes
 *     the path to the file. This is just the name of the file along with the
 *     extension.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.DownloadExportItem = function(
    format,
    iconFileName,
    domHelper,
    editModeManager,
    exportManager,
    actionManager,
    toolTip) {
  /**
   * The format to export into.
   * @private {audioCat.audio.render.ExportFormat}
   */
  this.format_ = format;

  /**
   * The name of the file for the icon. Excluding the path to it.
   * @private {string}
   */
  this.iconFileName_ = iconFileName;

  /**
   * @private {!audioCat.audio.render.ExportManager}
   */
  this.exportManager_ = exportManager;

  /**
   * Whether this button is on (the user can use it).
   * @private {boolean}
   */
  this.on_ = true;

  var formatString;
  switch (format) {
    case audioCat.audio.render.ExportFormat.MP3:
      formatString = 'mp3';
      break;
    case audioCat.audio.render.ExportFormat.WAV:
      formatString = 'wav';
      break;
  }
  goog.asserts.assert(formatString);

  var label = 'Download as ' + formatString + '.';
  goog.base(this, domHelper, editModeManager, actionManager, toolTip,
      label, undefined, undefined, label);
  goog.dom.classes.add(this.getDom(), goog.getCssName('unfadableItem'));

  /**
   * The loading widget overlaid on this item when a file is being generated.
   * @private {audioCat.ui.widget.LoadingWidget}
   */
  this.loadingWidget_ = null;

  // Disable this button while exporting files of the format to prevent overlap.
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_BEGAN,
      this.handleExportBegan_, false, this);
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_FAILED,
      this.handleExportStateChange_, false, this);
  goog.events.listen(exportManager,
      audioCat.audio.render.EventType.EXPORTING_SUCCEEDED,
      this.handleExportStateChange_, false, this);

  /**
   * Whether the item is currently visually enabled.
   * @private {boolean}
   */
  this.visuallyEnabled_ = false;

  // Initialize to either enabled or disabled based on export state.
  this.determineWhetherEnabled_(exportManager, true);
};
goog.inherits(
    audioCat.ui.toolbar.item.DownloadExportItem, audioCat.ui.toolbar.item.Item);

/**
 * Handles what happens when exporting begins.
 * @param {!audioCat.audio.render.ExportingBeganEvent} event The event
 *     associated with the beginning of exporting.
 * @private
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.handleExportBegan_ =
    function(event) {
  if (event.getFormat() == this.format_) {
    // Treat this event as if it were an exporting state change first.
    this.handleExportStateChange_(event);

    // A file is now being created.
    this.loadingWidget_ = new audioCat.ui.widget.LoadingWidget(this.domHelper);
    goog.events.listen(
        /** @type {!audioCat.audio.render.ExportManager} */ (event.target),
        audioCat.audio.render.EventType.EXPORTING_PROGRESS,
        this.handleProgress_, false, this);
    this.domHelper.appendChild(this.getDom(), this.loadingWidget_.getDom());
  }
};

/**
 * Handles changes in progress.
 * @param {!audioCat.audio.render.ExportingProgressEvent} event The event
 *     associated with progress being made.
 * @private
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.handleProgress_ =
    function(event) {
  if (event.getFormat() == this.format_) {
    goog.asserts.assert(this.loadingWidget_);
    this.loadingWidget_.setProgress(event.getProgress());
  }
};

/**
 * Handles changes in exporting state (whether we are currently exporting).
 * @param {!audioCat.audio.render.ExportingFailedEvent|
 *     !audioCat.audio.render.ExportingSucceededEvent|
 *     !audioCat.audio.render.ExportingBeganEvent} event The associated event.
 * @private
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.handleExportStateChange_ =
    function(event) {
  if (event.getFormat() == this.format_) {
    // This event is relevant to this format. Possibly take action.
    var exportManager = /** @type {!audioCat.audio.render.ExportManager} */ (
        event.target);
    if (!exportManager.getExportingState(this.format_)) {
      // We are no longer exporting the file.
      this.domHelper.removeNode(this.loadingWidget_.getDom());
      this.loadingWidget_.cleanUp();
      goog.events.unlisten(
          /** @type {!audioCat.audio.render.ExportManager} */ (event.target),
          audioCat.audio.render.EventType.EXPORTING_PROGRESS,
          this.handleProgress_, false, this);
    }
    this.determineWhetherEnabled_(exportManager);
  }
};

/**
 * Sets whether this item is on or off, so the user can't click on it.
 * @param {boolean} on
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.setOnValue =
    function(on) {
  if (this.on_ != on) {
    this.on_ = on;
    this.determineWhetherEnabled_(this.exportManager_, true);
  }
};

/**
 * Determines whether the item should be enabled, and sets it so.
 * @param {!audioCat.audio.render.ExportManager} exportManager Manages exporting
 *     of audio.
 * @param {boolean=} opt_forceSet Forces a new setting of the boolean
 *     regardless of whether the new state matches the previous one. Defaults to
 *     false.
 * @private
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.determineWhetherEnabled_ =
    function(exportManager, opt_forceSet) {
  var visuallyEnabled =
      this.on_ && !exportManager.getExportingState(this.format_);
  if (this.visuallyEnabled_ != visuallyEnabled || opt_forceSet) {
    if (visuallyEnabled) {
      this.domHelper.listenForUpPress(
          this.getDom(), this.handleExportRequest_, false, this);
    } else {
      this.domHelper.unlistenForUpPress(
          this.getDom(), this.handleExportRequest_, false, this);
    }
    this.visuallyEnabled_ = visuallyEnabled;
    this.setVisualizeEnabledState(visuallyEnabled);
  }
};

/**
 * Handles what happens when the user requests an export.
 * @private
 */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.handleExportRequest_ =
    function() {
  var action = /** @type {!audioCat.action.render.ExportAction} */ (
      this.actionManager.retrieveAction(audioCat.action.ActionType.EXPORT));
  action.setExportFormat(this.format_);
  action.doAction();
};

/** @override */
audioCat.ui.toolbar.item.DownloadExportItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/' + this.iconFileName_);
};
