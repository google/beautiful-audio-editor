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
goog.provide('audioCat.ui.widget.PlayWidgetRecordManager');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.record.Event');
goog.require('audioCat.state.command.MediaRecordAudioCommand');
goog.require('audioCat.ui.widget.EventType');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Manages the default recording button, which lets the user record.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!Element} container The container for the button. The container is to
 *     be interacted with via clicking and hovering.
 * @param {!audioCat.audio.record.MediaRecordManager} recordManager Manages
 *     recording of media.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.widget.PlayWidgetRecordManager = function(
    domHelper,
    actionManager,
    container,
    recordManager,
    commandManager,
    idGenerator) {
  goog.base(this);

  /**
   * Faciltates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The DOM element for the button.
   * @private {!Element}
   */
  this.container_ = container;

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Manages recording from media sources.
   * @private {!audioCat.audio.record.MediaRecordManager}
   */
  this.recordManager_ = recordManager;

  /**
   * The action that toggles recording.
   * @private {!audioCat.action.record.ToggleDefaultRecordAction}
   */
  this.toggleDefaultRecordAction_ =
      /** @type {!audioCat.action.record.ToggleDefaultRecordAction} */ (
          actionManager.retrieveAction(
              audioCat.action.ActionType.TOGGLE_DEFAULT_RECORDING));

  /**
   * Manages command history and thus allows for undo/redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * The current recording job. Or null if there is none.
   * @private {audioCat.audio.record.RecordingJob}
   */
  this.currentRecordingJob_ = null;

  var enabledState = recordManager.getDefaultRecordingReadyState();
  /**
   * Whether default recording is enabled or disabled.
   * @private {boolean}
   */
  this.enabled_ = enabledState;
  this.setEnabledState(enabledState); // Initializes the current state.
  if (!enabledState) {
    // If we are not enabled, enable when the recording manager is ready.
    goog.events.listenOnce(recordManager,
        audioCat.audio.record.Event.READY_FOR_DEFAULT_RECORDING,
        this.handleDefaultRecordingReady_, false, this);
  }
};
goog.inherits(audioCat.ui.widget.PlayWidgetRecordManager,
    audioCat.utility.EventTarget);

/**
 * @return {audioCat.audio.record.RecordingJob} The current job if there is one.
 *     If none, then no recording is currently occurring.
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.getCurrentRecordingJob =
    function() {
  return this.currentRecordingJob_;
};

/**
 * Sets the enabled state.
 * @param {boolean} enabledState The new enabled state.
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.setEnabledState =
    function(enabledState) {
  this.enabled_ = enabledState;
  var container = this.container_;
  var domHelper = this.domHelper_;
  if (enabledState) {
    this.enterRecordingMode_(false);
    domHelper.listenForPress(container, this.handleRecordPress_, false, this);
    this.recordManager_.listen(
        audioCat.audio.record.Event.DEFAULT_RECORDING_JOB_CREATED,
        this.handleDefaultRecordingJobCreated_, false, this);
    goog.dom.classes.remove(container, goog.getCssName('disabledWidgetButton'));
    goog.dom.classes.add(container, goog.getCssName('enabledWidgetButton'));
  } else {
    domHelper.unlistenForPress(container, this.handleRecordPress_, false, this);
    this.recordManager_.unlisten(
        audioCat.audio.record.Event.DEFAULT_RECORDING_JOB_CREATED,
        this.handleDefaultRecordingJobCreated_, false, this);
    goog.dom.classes.remove(container,
        goog.getCssName('defaultRecordButtonRecordingMode'));
    goog.dom.classes.remove(container, goog.getCssName('enabledWidgetButton'));
    goog.dom.classes.add(container, goog.getCssName('disabledWidgetButton'));
  }
  // Make the button focus-able, and tell screen readers what it does.
  domHelper.setTabIndex(container, 0);
  domHelper.setAriaLabel(container, this.determineAriaLabel_());
};

/**
 * Handles what happens when the button is pressed.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.handleRecordPress_ =
    function() {
  this.toggleDefaultRecordAction_.doAction();
};

/**
 * Either enters or exits recording mode.
 * @param {boolean} recordingMode Whether to enter or exit recording mode. If
 *     true, enters recording mode. If false, exits it.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.enterRecordingMode_ =
    function(recordingMode) {
  var container = this.container_;
  var domHelper = this.domHelper_;
  if (recordingMode) {
    domHelper.setRawInnerHtml(container, '&#9632;'); // A square.
    goog.dom.classes.remove(container,
        goog.getCssName('defaultRecordButtonNonRecordingMode'));
    goog.dom.classes.add(container,
        goog.getCssName('defaultRecordButtonRecordingMode'));
  } else {
    domHelper.setRawInnerHtml(container, '&#9679;'); // A circle.
    goog.dom.classes.remove(container,
        goog.getCssName('defaultRecordButtonRecordingMode'));
    goog.dom.classes.add(container,
        goog.getCssName('defaultRecordButtonNonRecordingMode'));
  }
  domHelper.setAriaLabel(container, this.determineAriaLabel_());
};

/**
 * Handles what happens when a default recording job has been created - note
 * that recording has not started yet.
 * @param {!audioCat.audio.record.RecordingJobCreatedEvent} event The associated
 *     event.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.
    handleDefaultRecordingJobCreated_ = function(event) {
  event.recordingJob.listenOnce(
      audioCat.audio.record.Event.DEFAULT_RECORDING_STARTED,
      this.handleRecordingJobStart_, false, this);
};

/**
 * Handles what happens when a recording job starts recording.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.handleRecordingJobStart_ =
    function(event) {
  var recordingJob = /** @type {!audioCat.audio.record.RecordingJob} */ (
      event.target);
  this.currentRecordingJob_ = recordingJob;
  recordingJob.listenOnce(audioCat.audio.record.Event.DEFAULT_RECORDING_STOPPED,
      this.handleRecordingJobEnd_, false, this);
  this.dispatchEvent(audioCat.ui.widget.EventType.DEFAULT_RECORDING_STARTED);
  this.enterRecordingMode_(true);
};

/**
 * Handles what happens when recording is signaled to end.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.handleRecordingJobEnd_ =
    function() {
  var recordingJob = /** @type {!audioCat.audio.record.RecordingJob} */(
      this.currentRecordingJob_);
  this.currentRecordingJob_ = null;
  this.enterRecordingMode_(false);
  this.dispatchEvent(audioCat.ui.widget.EventType.DEFAULT_RECORDING_STOPPED);
  recordingJob.listenOnce(
      audioCat.audio.record.Event.RECORDING_AUDIO_CHEST_READY,
      this.handleRecordingAudioChestReady_, false, this);
};

/**
 * Handles what happens when recording is signaled to end.
 * @param {!audioCat.audio.record.RecordingAudioChestReadyEvent} event The
 *     associated event.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.
    handleRecordingAudioChestReady_ = function(event) {
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.MediaRecordAudioCommand(
          this.idGenerator_, event.audioChest, event.beginTime));
};

/**
 * Determines the current aria label for the record button.
 * @return {string} The currently proper aria label.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.determineAriaLabel_ =
    function() {
  return this.enabled_ ?
      (this.currentRecordingJob_ ?
          'Stop recording.' : 'Record with microphone.') :
      'Disabled record button.';
};

/**
 * Handles what happens when default recording is ready.
 * @private
 */
audioCat.ui.widget.PlayWidgetRecordManager.prototype.
    handleDefaultRecordingReady_ = function() {
  this.setEnabledState(true);
};
