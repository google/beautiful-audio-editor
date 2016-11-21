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
goog.provide('audioCat.ui.TrackListingManager');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.templates');
goog.require('audioCat.ui.tracks.TrackEntry');
goog.require('audioCat.ui.tracks.effect.EffectChipDragManager');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Manages the display of tracks.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Faciliates interactions with
 *     the DOM.
 * @param {!audioCat.ui.keyboard.KeyboardManager} keyboardManager Manages
 *     keyboard shortcuts.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {!Element} entriesContainer The container in which to append track
 *     entries.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands, so users can redo and undo.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools 2D
 *     contexts, so we don't create too many.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the scale at which we render audio in the
 *     time domain.
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
 *     effectChipDragManager Manages the dragging of chips around.
 * @param {!audioCat.action.DisplayEffectSelectorAction}
 *     displayEffectSelectorAction An action for displaying the dialog for
 *     creating new effects.
 * @constructor
 */
audioCat.ui.TrackListingManager = function(
    idGenerator,
    domHelper,
    keyboardManager,
    trackManager,
    entriesContainer,
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
    displayEffectSelectorAction) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  /**
   * @private {!audioCat.ui.helperPanel.EffectContentProvider} Provides content
   *     to the helper panel when an effect is put in focus.
   */
  this.effectContentProvider_ = effectContentProvider;

  /**
   * Facilitates interactions with the DOM.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages keyboard interactions.
   * @private {!audioCat.ui.keyboard.KeyboardManager}
   */
  this.keyboardManager_ = keyboardManager;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * Track entries displayed.
   * @private {!Array.<!audioCat.ui.tracks.TrackEntry>}
   */
  this.trackEntries_ = [];

  /**
   * A drag list group that allows users to drag effect chips around.
   * @private
   */
  this.effectChipDragManager_ = effectChipDragManager;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * Formats time.
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  // Display tracks as they are added.
  goog.events.listen(trackManager, audioCat.state.events.TRACK_ADDED,
      this.handleTrackAddedEvent_, false, this);

  // Remove track entries as tracks are removed.
  goog.events.listen(trackManager, audioCat.state.events.TRACK_REMOVED,
      this.handleTrackRemovedEvent_, false, this);

  /**
   * The container for both elements of the track entry.
   * @private {!Element}
   */
  this.entriesContainer_ = entriesContainer;

  // Listen for soloing or un-soloing so we can apply UI effects.
  goog.events.listen(trackManager, audioCat.state.events.SOLOED_TRACK_CHANGED,
      this.handleChangeInSoloState_, false, this);

  // Listen for changes in edit mode manager.
  goog.events.listen(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
      this.handleEditModeChanged_, false, this);

  /**
   * Manages commands, so that users can undo and redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * Pools 2D contexts.
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * Manages the scale at which we render audio in the time domain scale.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * Maintains and updates the current edit mode.
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;
  this.setEditModeDataKey_();

  /**
   * Manages resizing and scrolling of the viewport.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.ZOOM_CHANGED, this.handleZoomChange_,
      false, this);

  /**
   * Mapping from track ID to track entry DOM.
   * @private {!Object<audioCat.utility.Id, !Element>}
   */
  this.trackIdDomMapping_ = {};

  /**
   * Manages the time indicated to the user.
   * @private {!audioCat.audio.play.TimeManager}
   */
  this.timeManager_ = timeManager;

  /**
   * Manages the playing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  // Listen for changes in play state so we can handle add effects to the UI
  // for solo-ed and muted tracks while the audio is playing.
  goog.events.listen(playManager, audioCat.audio.play.events.PAUSED,
      this.handlePlayStateChange_, false, this);
  goog.events.listen(playManager, audioCat.audio.play.events.PLAY_BEGAN,
      this.handlePlayStateChange_, false, this);

  /**
   * An action for displaying the dialog box for adding new effects.
   * @private {!audioCat.action.DisplayEffectSelectorAction}
   */
  this.displayEffectSelectorAction_ = displayEffectSelectorAction;
};

/**
 * Handles a zoom change.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handleZoomChange_ = function() {
  // Redraw tracks.
  var trackEntries = this.trackEntries_;
  var numberOfTrackEntries = trackEntries.length;
  for (var i = 0; i < numberOfTrackEntries; ++i) {
    trackEntries[i].triggerRedraw();
  }

  // Have the view include the current play time after the zoom change.
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var playTimePixelEquivalent = scale.convertToPixels(
      this.timeManager_.getIndicatedTime());
  var scrollResizeManager = this.scrollResizeManager_;
  var targetScroll = Math.floor(playTimePixelEquivalent -
      scrollResizeManager.getWindowWidth() / 3);
  targetScroll = (targetScroll < 0) ? 0 : targetScroll;
  scrollResizeManager.scrollTo(
      targetScroll, scrollResizeManager.getTopBottomScroll());
};

/**
 * Adds a track entry to some entity.
 * @param {!audioCat.state.Track} track The track to add an entry for.
 * @param {number=} opt_index The index at which to add the track. If not
 *     provided, the track is added at the end.
 */
audioCat.ui.TrackListingManager.prototype.addTrackEntry =
    function(track, opt_index) {
  var trackEntries = this.trackEntries_;
  var newTrackEntry = new audioCat.ui.tracks.TrackEntry(this.idGenerator_,
      this.domHelper_, track, this.commandManager_, this.context2dPool_,
      this.timeDomainScaleManager_, this.editModeManager_,
      this.scrollResizeManager_, this.timeManager_, this.playManager_,
      this.dialogManager_, this.timeFormatter_, this.audioUnitConverter_,
      this.effectContentProvider_, this.effectChipDragManager_,
      this.displayEffectSelectorAction_, this.keyboardManager_);
  var trackIndex = goog.isDef(opt_index) ? opt_index : trackEntries.length;
  goog.array.insertAt(trackEntries, newTrackEntry, trackIndex);

  var domHelper = this.domHelper_;
  var trackEntryContainer = domHelper.createElement('div');
  goog.dom.classes.add(
      trackEntryContainer, goog.getCssName('singleTrackEntryContainer'));
  var descriptorDom = newTrackEntry.getDescriptorDom();
  domHelper.appendChild(trackEntryContainer, descriptorDom);
  this.scrollResizeManager_.fixLeft(descriptorDom);
  domHelper.appendChild(trackEntryContainer, newTrackEntry.getAudioRowDom());

  // Add the whole tracke entry.
  goog.dom.classes.add(trackEntryContainer, goog.getCssName('hiddenTrack'));
  goog.dom.classes.add(
      trackEntryContainer, goog.getCssName('transitioningTrack'));
  domHelper.insertChildAt(
      this.entriesContainer_, trackEntryContainer, trackIndex);

  // Asynchronously remove the class to trigger a fade-in.
  goog.global.setTimeout(function() {
    goog.dom.classes.remove(
        trackEntryContainer, goog.getCssName('hiddenTrack'));
  }, 1);

  // Don't keep the transition lest the track be slow.
  goog.global.setTimeout(function() {
    goog.dom.classes.remove(
        trackEntryContainer, goog.getCssName('transitioningTrack'));
  }, 500);

  this.trackIdDomMapping_[track.getId()] = trackEntryContainer;
};

/**
 * Removes a track entry.
 * @param {number} trackIndex A whole number. The index of the track entry we
 *     seek to remove.
 */
audioCat.ui.TrackListingManager.prototype.removeTrackEntry =
    function(trackIndex) {
  var trackEntries = this.trackEntries_;
  var trackEntry = trackEntries[trackIndex];
  var domHelper = this.domHelper_;
  // TODO(chizeng): Get the track based on the index instead.
  var track = trackEntry.getTrack();
  var trackEntryDom = this.trackIdDomMapping_[track.getId()];

  domHelper.removeNode(trackEntryDom);
  goog.array.removeAt(trackEntries, trackIndex);
  this.scrollResizeManager_.removeFromFixLeft(trackEntry.getDescriptorDom());
  trackEntry.cleanUp();
};

/**
 * Handles a new track being added.
 * @param {!audioCat.state.TrackAddedEvent} event The event associated with the
 *     new track being added.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handleTrackAddedEvent_ =
    function(event) {
  this.addTrackEntry(event.getTrack(), event.getTrackIndex());
};

/**
 * Handles a new track being removed.
 * @param {!audioCat.state.TrackRemovedEvent} event The event associated with a
 *     track being removed.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handleTrackRemovedEvent_ =
    function(event) {
  this.removeTrackEntry(event.getTrackIndex());
};

/**
 * Handles what happens when playing stops or begins. This lets us add special
 * UI effects to solo-ed or muted tracks.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handlePlayStateChange_ = function() {
  (this.playManager_.getPlayState() ?
      goog.dom.classes.add : goog.dom.classes.remove)(
          this.entriesContainer_, goog.getCssName('currentlyPlaying'));
};

/**
 * Handles what happens when the solo state of the track manager changes. This
 * means either a track was solo-ed or un-soloed.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handleChangeInSoloState_ =
    function() {
  (this.trackManager_.getSoloedTrack() ?
      goog.dom.classes.add : goog.dom.classes.remove)(
          this.entriesContainer_, goog.getCssName('soloedState'));
};

/**
 * Handles changes in edit mode.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.handleEditModeChanged_ = function() {
  this.setEditModeDataKey_();
};

/**
 * Sets the data key for the edit mode so that child elements can make use of
 * it. For example, the speed alterer differs based on whether the current mode
 * is edit mode.
 * @private
 */
audioCat.ui.TrackListingManager.prototype.setEditModeDataKey_ = function() {
  this.entriesContainer_.setAttribute('data-m',
      '' + this.editModeManager_.getCurrentEditMode().getName());
};
