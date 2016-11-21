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
goog.provide('audioCat.ui.tracks.TrackEntry');

goog.require('audioCat.state.command.ChangeMuteTrackCommand');
goog.require('audioCat.state.command.ChangeSoloTrackCommand');
goog.require('audioCat.state.command.ChangeTrackNameCommand');
goog.require('audioCat.state.command.RemoveTrackCommand');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.envelope.EnvelopeRenderer');
goog.require('audioCat.ui.tracks.StringConstant');
goog.require('audioCat.ui.tracks.TrackPanSlider');
goog.require('audioCat.ui.tracks.TrackVolumeSlider');
goog.require('audioCat.ui.tracks.effect.EffectChipsAlterer');
goog.require('audioCat.ui.tracks.effect.FxAppearButtonManager');
goog.require('audioCat.ui.tracks.endpoint.EndpointManager');
goog.require('audioCat.ui.visualization.SectionTimeDomainVisualization');
goog.require('audioCat.ui.widget.ClipDetectorWidget');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.string');
goog.require('soy');


/**
 * Manages the audio for a single track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions DOM
 *     interactions.
 * @param {!audioCat.state.Track} track The track this entry pertains to.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands so that the user can undo and redo.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools 2D
 *     contexts, so we don't create too many.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the scale at which we render audio.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Maintains
 *     and updates the current edit mode.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     scrolling and resizing of the viewport.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the time
 *     indicated to the user by the UI.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between different units of audio and various standards.
 * @param {!audioCat.ui.helperPanel.EffectContentProvider} effectContentProvider
 *     Provides content to the helper panel when an effect is put in focus.
 * @param {!audioCat.ui.tracks.effect.EffectChipDragManager}
 *     effectChipDragManager Manages the dragging of effect chips.
 * @param {!audioCat.action.DisplayEffectSelectorAction}
 *     displayEffectSelectorAction An action for displaying the dialog for
 *     creating new effects.
 * @param {!audioCat.ui.keyboard.KeyboardManager} keyboardManager Manages
 *     keyboard shortcuts.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.tracks.TrackEntry = function(
    idGenerator,
    domHelper,
    track,
    commandManager,
    context2dPool,
    timeDomainScaleManager,
    editModeManager,
    scrollResizeManager,
    timeManager,
    playManager,
    dialogManager,
    timeFormatter,
    audioUnitConverter,
    effectContentProvider,
    effectChipDragManager,
    displayEffectSelectorAction,
    keyboardManager) {
  goog.base(this);

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages keyboard interactions.
   * @private {!audioCat.ui.keyboard.KeyboardManager}
   */
  this.keyboardManager_ = keyboardManager;

  /**
   * Manages commands and command history.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * The track this entry pertains to.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * Manages the endpoints (both begin and final) of sections so that we can
   * easily display them in order or begin time and stack them together.
   * @private {!audioCat.ui.tracks.endpoint.EndpointManager}
   */
  this.endpointManager_ = new audioCat.ui.tracks.endpoint.EndpointManager(
      track);

  /**
   * Formats time for display.
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  // When a section is added, update the track.
  // TODO(chizeng): Clean up these listeners when the track gets removed.
  goog.events.listen(track, audioCat.state.events.SECTION_ADDED,
      this.handleSectionAddedEvent_, false, this);
  goog.events.listen(track, audioCat.state.events.SECTION_REMOVED,
      this.handleSectionRemovedEvent_, false, this);
  // Some section in this track has changed begin time or overall duration.
  goog.events.listen(track, audioCat.state.events.SECTION_TIME_PROPERTY_CHANGED,
      this.handleSectionTimePropertyChangedEvent_, false, this);

  /**
   * Pools 2D contexts.
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * Manages scrolling and resizing, and responding to them.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Manages zoom levels.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  var trackDescriptorDom = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.templates.TrackDescriptorBox, {
          trackName: track.getName()
      }));
  /**
   * The DOM node for the track descriptor.
   * @private {!Element}
   */
  this.trackDescriptorDom_ = trackDescriptorDom;

  // Refer to the track object on the descriptor DOM so that we can determine if
  // we need to switch tracks for a section of audio.
  trackDescriptorDom[audioCat.ui.tracks.StringConstant.TRACK_OBJECT] = track;

  /**
   * The element for editing the name of the track.
   * @private {!Element}
   */
  this.trackNameElement_ = domHelper.getElementByClassForSure(
      goog.getCssName('trackTitleDisplay'), trackDescriptorDom);

  // Respond to changes in the track title.
  goog.events.listen(this.trackNameElement_, 'focus',
      this.handleTrackTitleDisplayFocus_, false, this);
  goog.events.listen(this.trackNameElement_, 'blur',
      this.handleTrackTitleDisplayBlur_, false, this);
  goog.events.listen(this.trackNameElement_, 'input',
      this.respondToTrackTitleDisplayInput_, false, this);
  goog.events.listen(this.trackNameElement_, 'change',
      this.respondToTrackTitleDisplayChange_, false, this);

  var effectManager = track.getEffectManager();

  /**
   * Controls the UI for altering chips representing effects. Clean this up
   * while cleaning up the track entry.
   * @private {!audioCat.ui.tracks.effect.EffectChipsAlterer}
   */
  this.effectChipsAlterer_ = new audioCat.ui.tracks.effect.EffectChipsAlterer(
      idGenerator,
      domHelper,
      commandManager,
      effectContentProvider,
      effectManager,
      track.getAudioAnalyser(),
      effectChipDragManager,
      displayEffectSelectorAction);
  domHelper.appendChild(domHelper.getElementByClassForSure(
          goog.getCssName('effectChipsAltererWrapper'), trackDescriptorDom),
      this.effectChipsAlterer_.getDom());

  /**
   * The button for making the UI for altering effect chips appear. Clean this
   * up while cleaning up the track entry.
   * @private {!audioCat.ui.tracks.effect.FxAppearButtonManager}
   */
  this.fxEffectChipsAppearButtonManager_ =
      new audioCat.ui.tracks.effect.FxAppearButtonManager(
          domHelper, effectManager, this.effectChipsAlterer_,
          domHelper.getElementByClassForSure(
              goog.getCssName('fxButton'), trackDescriptorDom));

  /**
   * The DOM node for the row of track audio data. This includes the time-domain
   * wave forms as well as envelopes.
   * @private {!Element}
   */
  this.trackAudioRowDom_ = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.templates.TrackAudioArea));

  // Refer to the track object on the audio row DOM so that we can determine if
  // we need to switch tracks for a section of audio.
  this.trackAudioRowDom_[audioCat.ui.tracks.StringConstant.TRACK_OBJECT] =
      track;

  /**
   * The button for muting the track.
   * @private {!Element}
   */
  this.muteButton_ = domHelper.getElementByClassForSure(
      goog.getCssName('trackMuteButton'), trackDescriptorDom);
  // TODO(chizeng): Remove these listeners when cleaning up the track entry.
  domHelper.listenForPress(
      this.muteButton_, this.handleMuteButtonPress_, false, this);
  goog.events.listen(track, audioCat.state.events.TRACK_MUTE_CHANGED,
      this.handleTrackMuteStateChange_, false, this);
  // Visualize the button based on the mute state.
  this.visualizeCorrectTrackMuteState_();

  /**
   * The button for solo-ing the track.
   * @private {!Element}
   */
  this.soloButton_ = domHelper.getElementByClassForSure(
      goog.getCssName('trackSoloButton'), trackDescriptorDom);
  domHelper.listenForPress(
      this.soloButton_, this.handleSoloButtonPress_, false, this);
  goog.events.listen(track, audioCat.state.events.TRACK_SOLO_CHANGED,
      this.handleTrackSoloStateChange_, false, this);
  this.visualizeCorrectTrackSoloState_();

  /**
   * The button for deleting the track.
   * @private {!Element}
   */
  this.deleteButton_ = domHelper.getElementByClassForSure(
      goog.getCssName('trackDeleteButton'), trackDescriptorDom);
  domHelper.listenForPress(
      this.deleteButton_, this.handleDeleteButtonPress_, false, this);

  /**
   * Indicates clipping if there is any.
   * @private {!audioCat.ui.widget.ClipDetectorWidget}
   */
  this.clipDetectorWidget_ = new audioCat.ui.widget.ClipDetectorWidget(
      domHelper,
      playManager,
      track.getAudioAnalyser(),
      track.getNumberOfChannels());
  domHelper.appendChild(trackDescriptorDom, this.clipDetectorWidget_.getDom());

  /**
   * Maintains and updates the current edit mode.
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;

  /**
   * Manages the time indicated to the user.
   * @private {!audioCat.audio.play.TimeManager}
   */
  this.timeManager_ = timeManager;

  /**
   * Manages playing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * The last stable name of the track.
   * @private {string}
   */
  this.lastTrackStableName_ = track.getName();

  // TODO(chizeng): Remove this listener when the track entry is cleaned up.
  goog.events.listen(track, audioCat.state.events.TRACK_NAME_CHANGED,
      this.handleTrackNameChangeEvent_, false, this);

  /**
   * Renders the volume envelope.
   * @private {!audioCat.ui.envelope.EnvelopeRenderer}
   */
  this.volumeEnvelopeRenderer_ = new audioCat.ui.envelope.EnvelopeRenderer(
      idGenerator,
      domHelper,
      track.getVolumeEnvelope(),
      context2dPool,
      scrollResizeManager,
      timeDomainScaleManager,
      commandManager,
      goog.getCssName('volumeEnvelopeContainer'));
  var trackEnvelopeArea = domHelper.getElementByClassForSure(
      goog.getCssName('trackEnvelopeArea'), this.trackAudioRowDom_);
  domHelper.appendChild(
      trackEnvelopeArea, this.volumeEnvelopeRenderer_.getDom());

  // /**
  //  * Renders the pan envelope.
  //  * @private {!audioCat.ui.envelope.EnvelopeRenderer}
  //  */
  // this.panEnvelopeRenderer_ = new audioCat.ui.envelope.EnvelopeRenderer(
  //     domHelper,
  //     track.getPanEnvelope(),
  //     context2dPool,
  //     scrollResizeManager,
  //     timeDomainScaleManager,
  //     commandManager,
  //     goog.getCssName('panEnvelopeContainer'),
  //     'L',
  //     'R');

  // There is no good way yet to linearly alter pan, so don't provide this
  //     feature for now.
  // domHelper.appendChild(
  //     trackEnvelopeArea, this.panEnvelopeRenderer_.getDom());

  // TODO(chizeng): Clean up the sliders (unlisten the listeners for instance)
  // when the TrackEntry gets removed. We'll recreate them during a redo.
  // Altering the volume slider should change the overall gain of the track.
  var volumeSlider = new audioCat.ui.tracks.TrackVolumeSlider(
      idGenerator,
      domHelper,
      track,
      commandManager,
      dialogManager,
      audioUnitConverter);
  var volumeSliderContainer = domHelper.getElementByClassForSure(
      goog.getCssName('volumeSliderContainer'), this.trackDescriptorDom_);
  domHelper.appendChild(volumeSliderContainer, volumeSlider.getDom());

  var panSlider = new audioCat.ui.tracks.TrackPanSlider(
      idGenerator, domHelper, track, commandManager, dialogManager);
  var panSliderContainer = domHelper.getElementByClassForSure(
      goog.getCssName('panSliderContainer'), this.trackDescriptorDom_);
  domHelper.appendChild(panSliderContainer, panSlider.getDom());

  // Draw out all the sections.
  var numberOfSections = track.getNumberOfSections();
  var waveFormContainer = domHelper.getElementByClassForSure(
      goog.getCssName('trackWaveformDisplay'), this.trackAudioRowDom_);
  var sectionIdDomMapping = {};
  for (var i = 0; i < numberOfSections; ++i) {
    var section = track.getSectionAtIndexFromBeginning(i);
    var sectionVisualization = this.createSectionVisualization_(section);
    domHelper.appendChild(waveFormContainer, sectionVisualization.getDom());
    sectionIdDomMapping[section.getId()] = sectionVisualization;
  }

  /**
   * A mapping of section IDs to the section visualization widgets that
   * encapsulate the DOM elements for the visualizations.
   * @private {!Object.<audioCat.utility.Id,
   *    !audioCat.ui.visualization.SectionTimeDomainVisualization>}
   */
  this.sectionIdDomMapping_ = sectionIdDomMapping;

  /**
   * The DOM containing waveforms for time-domain data for the track.
   * @private {!Element}
   */
  this.waveFormDom_ = waveFormContainer;

  /**
   * The display height level of the wave form. Set this to -1 to trigger a
   * change on the first call to position sections.
   * @private {number}
   */
  this.waveFormDisplayHeightLevel_ = -1;

  // Position the sections assuming that the sections are in order.
  this.positionSections_();

  // When the edit mode switches to select, set up listeners.
  goog.events.listen(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
          this.handleEditModeChange_, false, this);
  this.activateEditMode_(editModeManager.getCurrentEditMode());
};
goog.inherits(audioCat.ui.tracks.TrackEntry, audioCat.utility.EventTarget);

/**
 * Handles changes in section timing in the track.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleSectionTimePropertyChangedEvent_ =
    function() {
  // Sort the endpoints again.
  this.endpointManager_.sortEndpoints();
  this.positionSections_();
};

/**
 * Triggers a redraw. Type-checking is suppressed due to iterating through an
 * object.
 * @suppress {checkTypes}
 */
audioCat.ui.tracks.TrackEntry.prototype.triggerRedraw = function() {
  // Redraw all the section visualizations.
  var sectionIdDomMapping = this.sectionIdDomMapping_;
  for (var sectionId in sectionIdDomMapping) {
    sectionIdDomMapping[sectionId].redrawAndReposition();
  }

  // Redraw the envelope.
  this.volumeEnvelopeRenderer_.redrawAndReposition();
};

/**
 * @return {!audioCat.state.Track} The track.
 */
audioCat.ui.tracks.TrackEntry.prototype.getTrack = function() {
  return this.track_;
};

/**
 * Handles what happens when the mute button is pressed for the track.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleMuteButtonPress_ = function() {
  var track = this.track_;
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.ChangeMuteTrackCommand(
          track,
          !track.getMutedState(),
          this.idGenerator_));
};

/**
 * Handles what happens when the solo button is pressed for the track.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleSoloButtonPress_ = function() {
  var track = this.track_;
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.ChangeSoloTrackCommand(
          track,
          !track.getSoloedState(),
          this.idGenerator_));
};

/**
 * Sets how a track button is visualized based on whether the button is active.
 * @param {!Element} button The element for the button.
 * @param {boolean} state If true, visualizes the button as active. If false,
 *     visualizes the button as inactive.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.
    visualizeButtonActiveState_ = function(button, state) {
  var functionToUse = state ? goog.dom.classes.add : goog.dom.classes.remove;
  functionToUse(button, goog.getCssName('activeTrackButton'));
};

/**
 * Handles what happens when the muted state of the track changes.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleTrackMuteStateChange_ =
    function() {
  this.visualizeCorrectTrackMuteState_();
};

/**
 * Sets the correct visual state for the mute button.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.visualizeCorrectTrackMuteState_ =
    function() {
  var trackMutedState = this.track_.getMutedState();
  this.visualizeButtonActiveState_(this.muteButton_, trackMutedState);

  // Make this track a little transparent upon becoming muted.
  var functionToUse = trackMutedState ?
      goog.dom.classes.add : goog.dom.classes.remove;

  functionToUse(this.trackAudioRowDom_, goog.getCssName('mutedState'));
  functionToUse(this.trackDescriptorDom_, goog.getCssName('mutedState'));
};

/**
 * Handles what happens when the solo-ed state of the track changes.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleTrackSoloStateChange_ =
    function() {
  this.visualizeCorrectTrackSoloState_();
};

/**
 * Sets the correct visual state for the solo button.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.visualizeCorrectTrackSoloState_ =
    function() {
  var soloedState = this.track_.getSoloedState();
  this.visualizeButtonActiveState_(this.soloButton_, soloedState);

  // Make other tracks somewhat transparent, but not this one upon solo-ing.
  var functionToUse = soloedState ?
      goog.dom.classes.add : goog.dom.classes.remove;

  functionToUse(this.trackAudioRowDom_, goog.getCssName('soloedTrack'));
  functionToUse(this.trackDescriptorDom_, goog.getCssName('soloedTrack'));
};

/**
 * Handles what happens when the delete button is pressed for the track.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleDeleteButtonPress_ = function() {
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.RemoveTrackCommand(
          this.track_,
          this.idGenerator_));
};

/**
 * Activates an edit mode for this track entry.
 * @param {!audioCat.state.editMode.EditMode} editMode The edit mode to
 *     activate.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.activateEditMode_ = function(editMode) {
  var editModeName = editMode.getName();
  var specificMode;
  switch (editModeName) {
    case audioCat.state.editMode.EditModeName.SELECT:
      if (!FLAG_MOBILE) {
        specificMode = /** @type {!audioCat.state.editMode.SelectEditMode} */ (
            editMode);
        // Start listening to when the user mouse overs this track entry while
        // trying to move a section of audio around. Only applies for Desktop.
        goog.events.listen(specificMode,
            audioCat.state.editMode.Events.SECTION_PRESS_DOWN_INSTIGATED,
            this.handleDownPressDetected_, false, this);
      }
      break;
  }
};

/**
 * Deactivates an edit mode for this track entry.
 * @param {!audioCat.state.editMode.EditMode} editMode The edit mode to
 *     de-activate.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.deActivateEditMode_ =
    function(editMode) {
  var editModeName = editMode.getName();
  var specificMode;
  switch (editModeName) {
    case audioCat.state.editMode.EditModeName.SELECT:
      if (!FLAG_MOBILE) {
        specificMode = /** @type {!audioCat.state.editMode.SelectEditMode} */ (
            editMode);
        // Stop listening to when the user mouse overs this track entry while
        // trying to move a section of audio around. Only applies for Desktop.
        goog.events.unlisten(specificMode,
            audioCat.state.editMode.Events.SECTION_PRESS_DOWN_INSTIGATED,
            this.handleDownPressDetected_, false, this);
      }
      break;
  }
};

/**
 * Handles what happens when a downpress on a section of audio has been
 * detected. Specifically, starts listening for mouse moves.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleDownPressDetected_ = function() {
  var domHelper = this.domHelper_;
  var waveFormDom = this.waveFormDom_;
  var doc = domHelper.getDocument();
  domHelper.listenForMove(
      waveFormDom, this.handlePotentialTrackSwitch_, false, this);

  // Stop listening to mouse moves after a mouse up.
  domHelper.listenForUpPress(
      doc, this.handleUpPressDetected_, false, this, true);
};

/**
 * Handles what happens when an up-press on a section of audio has been
 * detected. Specifically, unlistens for mouse moves.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleUpPressDetected_ = function() {
  // TODO(chizeng): Finalize the section track and offset. Create a command
  // so that we can do or undo.
  var domHelper = this.domHelper_;
  var waveFormDom = this.waveFormDom_;
  domHelper.unlistenForMove(
      waveFormDom, this.handlePotentialTrackSwitch_, false, this);
};

/**
 * Handles potential switching of tracks when the user drags an audio section
 * into it.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handlePotentialTrackSwitch_ =
    function() {
  var mode = /** {!audioCat.state.editMode.SelectEditMode} */ (
      this.editModeManager_.getCurrentEditMode());
  var sectionEntries = mode.getSelectedSectionEntries();
  var numberOfSectionEntries = sectionEntries.length;
  for (var i = 0; i < numberOfSectionEntries; ++i) {
    var sectionEntry = sectionEntries[i];
    var section = sectionEntry.getSection();

    // If the section is not in this track ...
    var oldTrack = section.getTrack();
    var thisTrack = this.track_;
    if (oldTrack.getId() != thisTrack.getId()) {
      // Do not compute the horizontal scroll while in limbo (ie, while section
      // is being switched).
      var scrollResizeManager = this.scrollResizeManager_;
      scrollResizeManager.setIsGoodTimeForScrollCompute(false);

      // Remove the section from the previous track.
      oldTrack.removeSection(section);

      // Add the section to this track.
      thisTrack.addSection(section);

      // Re-allow horizontal scroll computations.
      scrollResizeManager.setIsGoodTimeForScrollCompute(false);
    }
  }
};

/**
 * Handles a change in edit mode.
 * @param {!audioCat.state.editMode.EditModeChangedEvent} event The event
 *     associated with the edit mode changing.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleEditModeChange_ =
    function(event) {
  this.deActivateEditMode_(event.getPreviousEditMode());
  this.activateEditMode_(event.getNewEditMode());
};

/**
 * Visualizes a single section of audio.
 * @param {!audioCat.state.Section} section The section of audio to visualize.
 *     The section should belong to the track.
 * @return {!audioCat.ui.visualization.SectionTimeDomainVisualization}
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.createSectionVisualization_ =
    function(section) {
  var visualization =
      new audioCat.ui.visualization.SectionTimeDomainVisualization(
          section,
          this.track_,
          this.context2dPool_,
          this.timeDomainScaleManager_,
          this.editModeManager_,
          this.domHelper_,
          this.timeManager_,
          this.playManager_,
          this.timeFormatter_,
          this.scrollResizeManager_,
          this.commandManager_,
          this.idGenerator_);
  return visualization;
};

/**
 * Creates a time-domain visualization for a section of audio and includes the
 * visualization in the track entry.
 * @param {!audioCat.state.Section} section The section of audio to visualize.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.addSectionVisualization_ =
    function(section) {
  // TODO(chizeng): Store visualizations in binary order based on time.
  var sectionVisualization = this.createSectionVisualization_(section);
  this.domHelper_.appendChild(this.waveFormDom_, sectionVisualization.getDom());
  this.sectionIdDomMapping_[section.getId()] = sectionVisualization;
  // Let this section contribute to scrolling width of application.
  sectionVisualization.rectifyDimensions();
};

/**
 * Handles the event thrown when a section is added.
 * @param {!audioCat.state.SectionAddedEvent} event The event thrown when a
 *     section is added.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleSectionAddedEvent_ =
    function(event) {
  var section = event.getSection();
  this.endpointManager_.addSectionEndpoints(section);
  this.addSectionVisualization_(section);

  // Position the sections assuming that the endpoints are already sorted.
  this.positionSections_();
};

/**
 * Positions the section visualizations assuming that the endpoints have been
 * sorted.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.positionSections_ = function() {
  var endpointManager = this.endpointManager_;
  var numberOfEndpoints = endpointManager.getNumberOfEndpoints();
  var idToVisualizationMapping = this.sectionIdDomMapping_;

  // 0 if and only if we are once again at the top level.
  var stackedState = 0;
  var displayLevel = 0;

  // We iterate through the sections as we iterate through the endpoints.
  var track = this.track_;
  var numberOfSections = track.getNumberOfSections();
  var sectionIndex = 0;
  var maxDisplayLevel = displayLevel;
  for (var i = 0; i < numberOfEndpoints; ++i) {
    var endpoint = endpointManager.getEndpointAtIndex(i);
    if (endpoint.isFinalEndpoint()) {
      --stackedState;
      if (stackedState == 0) {
        // We can afford once again to draw visualizations at the top level.
        displayLevel = 0;
      }
    } else {
      // We have an initial endpoint.
      var section = endpoint.getSection();
      var visualization = idToVisualizationMapping[section.getId()];
      visualization.setDisplayLevel(displayLevel);

      // Set display level for the next iteration.
      var nextSectionIndex = sectionIndex + 1;
      if (nextSectionIndex < numberOfSections) {
        // We have a subsequent section. Check to see if it overlaps.
        var nextSection = track.getSectionAtIndexFromBeginning(
            nextSectionIndex);
        if (section.getBeginTime() + section.getDuration() >
            nextSection.getBeginTime()) {
          // We have overlap.
          ++displayLevel;
          if (displayLevel > maxDisplayLevel) {
            maxDisplayLevel = displayLevel;
          }
        }
        sectionIndex = nextSectionIndex;
        ++stackedState;
      } else {
        break;
      }
    }
  }

  // Sets the height of the whole waveform area.
  this.setWaveFormAreaHeightLevel_(maxDisplayLevel);
};

/**
 * Sets the height of the whole waveform area to this many times the height of
 * a single section of audio.
 * @param {number} displayLevel The display height level of the waveform.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.setWaveFormAreaHeightLevel_ =
    function(displayLevel) {
  if (displayLevel != this.waveFormDisplayHeightLevel_) {
    this.waveFormDisplayHeightLevel_ = displayLevel;
    this.waveFormDom_.style.height = String(
        (displayLevel + 1) * this.timeDomainScaleManager_.getSectionHeight()) +
            'px';
  }
};

/**
 * Handles the event dispatched when a section is removed.
 * @param {!audioCat.state.SectionRemovedEvent} event The event dispatched when
 *     a section is removed from the associated track.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleSectionRemovedEvent_ =
    function(event) {
  var section = event.getSection();
  var sectionId = section.getId();
  var sectionIdDomMapping = this.sectionIdDomMapping_;

  // Remove the visualization.
  var sectionVisualization = sectionIdDomMapping[sectionId];
  this.domHelper_.removeNode(sectionVisualization.getDom());

  // Get rid of the entry in the mapping.
  delete sectionIdDomMapping[sectionId];

  // Get rid of the section's endpoints.
  this.endpointManager_.removeSectionEndpoints(section);

  // Return the section visualization's canvases.
  sectionVisualization.cleanUp();

  // Position the sections assuming that the endpoints are already sorted.
  this.positionSections_();
};

/**
 * Handles what happens when the name of the track changes.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleTrackNameChangeEvent_ =
    function() {
  var newName = this.track_.getName();
  this.lastTrackStableName_ = newName;
  this.trackNameElement_.value = newName;
};

/**
 * Handles what happens when the track title display element has text inputed
 * into it.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.respondToTrackTitleDisplayInput_ =
    function() {
  this.track_.setName(this.trackNameElement_.value.trim(), true);
};

/**
 * Handles what happens when the track title display becomes in focus.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleTrackTitleDisplayFocus_ =
    function() {
  // Disable certain keyboard shortcuts while typing.
  this.keyboardManager_.setTypingState(true);
};

/**
 * Handles what happens when the track title display becomes in focus.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handleTrackTitleDisplayBlur_ =
    function() {
  // Re-enable certain keyboard shortcuts since the user is no longer typing.
  this.keyboardManager_.setTypingState(false);
};

/**
 * Handles what happens when the track title display element has stably changed.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.respondToTrackTitleDisplayChange_ =
    function() {
  var previousTrackName = this.lastTrackStableName_;
  var newTrackName = this.trackNameElement_.value.trim();
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.ChangeTrackNameCommand(
          this.track_,
          previousTrackName,
          newTrackName,
          this.idGenerator_),
      true);
  this.lastTrackStableName_ = newTrackName;
};

/**
 * @return {!Element} The DOM node for the track descriptor.
 */
audioCat.ui.tracks.TrackEntry.prototype.getDescriptorDom = function() {
  return this.trackDescriptorDom_;
};

/**
 * @return {!Element} The DOM node for the row of track audio data.
 */
audioCat.ui.tracks.TrackEntry.prototype.getAudioRowDom = function() {
  return this.trackAudioRowDom_;
};

/**
 * Handles changes to the pan slider.
 * @param {!goog.events.Event} event The event associated with the change.
 * @private
 */
audioCat.ui.tracks.TrackEntry.prototype.handlePanSliderChange_ =
    function(event) {
  var sliderElement = event.target;
  var sliderFloatValue =
      (goog.string.toNumber(sliderElement.value) + 1000) / 2000;
  this.track_.setPanFromLeft(sliderFloatValue);
};

/**
 * Cleans up the track entry after we finish using it.
 */
audioCat.ui.tracks.TrackEntry.prototype.cleanUp = function() {
  var unlistenFunction = goog.events.unlisten;
  var track = this.track_;
  var domHelper = this.domHelper_;

  unlistenFunction(track, audioCat.state.events.SECTION_ADDED,
      this.handleSectionAddedEvent_, false, this);
  unlistenFunction(track, audioCat.state.events.SECTION_REMOVED,
      this.handleSectionRemovedEvent_, false, this);
  unlistenFunction(track, audioCat.state.events.SECTION_TIME_PROPERTY_CHANGED,
      this.handleSectionTimePropertyChangedEvent_, false, this);

  unlistenFunction(this.trackNameElement_, 'input',
      this.respondToTrackTitleDisplayInput_, false, this);
  unlistenFunction(this.trackNameElement_, 'change',
      this.respondToTrackTitleDisplayChange_, false, this);
  unlistenFunction(this.trackNameElement_, 'focus',
      this.handleTrackTitleDisplayFocus_, false, this);
  unlistenFunction(this.trackNameElement_, 'blur',
      this.handleTrackTitleDisplayBlur_, false, this);

  // Remove DOM references to tracks to aid garbage collection.
  delete this.trackDescriptorDom_[
      audioCat.ui.tracks.StringConstant.TRACK_OBJECT];
  delete this.trackAudioRowDom_[audioCat.ui.tracks.StringConstant.TRACK_OBJECT];

  this.effectChipsAlterer_.cleanUp();
  this.fxEffectChipsAppearButtonManager_.cleanUp();
  this.clipDetectorWidget_.cleanUp();

  domHelper.unlistenForPress(
      this.muteButton_, this.handleMuteButtonPress_, false, this);
  unlistenFunction(track, audioCat.state.events.TRACK_MUTE_CHANGED,
      this.handleTrackMuteStateChange_, false, this);

  domHelper.unlistenForPress(
      this.soloButton_, this.handleSoloButtonPress_, false, this);
  unlistenFunction(track, audioCat.state.events.TRACK_SOLO_CHANGED,
      this.handleTrackSoloStateChange_, false, this);

  domHelper.unlistenForPress(
      this.deleteButton_, this.handleDeleteButtonPress_, false, this);

  unlistenFunction(track, audioCat.state.events.TRACK_NAME_CHANGED,
      this.handleTrackNameChangeEvent_, false, this);

  this.volumeEnvelopeRenderer_.cleanUp();

  // Remove references to visualizations so they get cleaned up.
  goog.object.forEach(this.sectionIdDomMapping_, function(visualization) {
    visualization.cleanUp();
  }, this);
  this.sectionIdDomMapping_ = {};
};
