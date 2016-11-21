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
goog.provide('audioCat.ui.visualization.SectionTimeDomainVisualization');

goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.state.editMode.MoveSectionEntry');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.tracks.StringConstant');
goog.require('audioCat.ui.visualization.SectionSpeedDragger');
goog.require('audioCat.ui.visualization.TimeUnit');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.style');


/**
 * Visualizes a section of audio in a track.
 * @param {!audioCat.state.Section} section The section of audio to visualize.
 * @param {!audioCat.state.Track} track The track the section belongs to.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools
 *     contexts so that we don't run out of memory by accident.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the scale at which we visualize audio in
 *     the time domain.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Maintains
 *     and updates the current edit mode.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the time
 *     indicated to the user by the UI.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     responding to scrolls and resizes.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands so that the user can undo and redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.visualization.SectionTimeDomainVisualization = function(
    section,
    track,
    context2dPool,
    timeDomainScaleManager,
    editModeManager,
    domHelper,
    timeManager,
    playManager,
    timeFormatter,
    scrollResizeManager,
    commandManager,
    idGenerator) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * An ID unique to the latest draw operation.
   * @private {audioCat.utility.Id}
   */
  this.drawId_ = idGenerator.obtainUniqueId();

  /**
   * The section of audio to visualize.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  // TODO(chizeng): Remove this listener if the visualization is removed.
  // Change how the section is visualized based on whether it is selected.
  goog.events.listen(
      section,
      audioCat.state.events.SECTION_MOVING_STATE_CHANGED,
      this.handleSectionMovingStateChange_, false, this);

  /**
   * The track that the section belongs to.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * Enqueues and dequeues commands, allowing for control and undo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

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

  /**
   * Formats time for display.
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  // Change the track if the section is put into a different track.
  goog.events.listen(section, audioCat.state.events.TRACK_CHANGED_FOR_SECTION,
      this.handleTrackChanged_, false, this);

  /**
   * The pool of 2D contexts.
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * Manages the scale at which we visualize audio in the time domain.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * The contexts to render the section in.
   * @private {!Array.<!CanvasRenderingContext2D>}
   */
  this.context2ds_ = [];

  var canvasContainer = domHelper.createDiv(
      goog.getCssName('sectionVisualizationCanvasContainer'));

  /**
   * Shows the current time to the user.
   * @private {!Element}
   */
  this.timeIndicator_ = domHelper.createDiv(
      goog.getCssName('sectionBeginTimeIndicator'));
  domHelper.appendChild(canvasContainer, this.timeIndicator_);

  /**
   * Facilitates interactions with the DOM.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The container for this section visualization widget.
   * @private {!Element}
   */
  this.container_ = domHelper.createDiv(
      goog.getCssName('sectionVisualizationContainer'));
  goog.base(this, this.container_);

  /**
   * The width of the last canvas to be drawn.
   * @private {number}
   */
  this.unscaledLastCanvasWidth_ = 0;

  /**
   * The container for all the canvases used to represent the audio.
   * @private {!Element}
   */
  this.canvasContainer_ = canvasContainer;
  domHelper.appendChild(this.container_, this.canvasContainer_);
  this.setCanvasContainerColor_();
  this.setCanvasContainerHeight_();

  /**
   * A container that displays the start time as the user drags the section
   * around. Only appears upon drag.
   * @private {!Element}
   */
  this.startTimeDisplayer_ = domHelper.createDiv(
      goog.getCssName('sectionStartTimeDisplayer'));
  this.updateTimeDisplay_();

  /**
   * The dragger that lets the user alter the speed of the section of audio.
   * Null if the current visualization is too small to visualize the audio.
   * @private {audioCat.ui.visualization.SectionSpeedDragger}
   */
  this.sectionSpeedDragger_ = null;

  /**
   * Manages scrolling and resizing.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  // Actually draw the wave form.
  this.drawWaves_();

  // TODO(chizeng): Find a way to visualize the section that allows for
  // updates by the section. Perhaps let the section fire events like finished
  // rendering.

  /**
   * An integer. The number of pixels from the left this section visualization
   * is positioned.
   * @private {number}
   */
  this.pixelsFromLeft_ = 0;

  // Set the correct distance from the left.
  this.setCorrectLeftDistance_();

  /**
   * The display level. Indicates how far from the top of a track entry to draw
   * the visualization. The visualization will be located this many times the
   * height of a single section from the top.
   * @private {number}
   */
  this.displayLevel_ = 1;
  // Trigger a change by changing the value.
  this.setDisplayLevel(0);

  /**
   * Maintains and updates the current edit mode.
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;

  var lineMarkingTimeInSection = domHelper.createElement('div');
  /**
   * A line that is displayed at a certain position in the section at various
   * times when it is needed.
   * @private {!Element}
   */
  this.lineMarkingTimeInSection_ = lineMarkingTimeInSection;
  goog.dom.classes.add(
      lineMarkingTimeInSection, goog.getCssName('lineMarkingTimeInSection'));

  // Change the width of canvases based on the playback rate.
  goog.events.listen(section, audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);

  // Respond to changes in edit mode.
  goog.events.listen(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
      this.handleEditModeChange_, false, this);
  // Activate the current mode.
  this.activateMode_(editModeManager.getCurrentEditMode());

  // Change the X-position of the section visualization when the begin time of
  // the section changes.
  // TODO(chizeng): Remove this listener after the section visualization is
      // removed.
  goog.events.listen(section,
      audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleSectionBeginTimeChange_, false, this);

  this.visualizeMovingState_();

  // For mobile browers, we artificially scroll, so we must change the position
  // of the section manually. Call the function upon adding.
  /**
   * The function (with a bound context) to call upon scrolling. The null
   * function when we do not implement our own scrolling.
   * @private {!Function}
   */
  this.boundMobileScrollHandleFunction_ = goog.nullFunction;
  if (FLAG_MOBILE) {
    this.boundMobileScrollHandleFunction_ =
        goog.bind(this.handleScrollForMobile_, this);
    scrollResizeManager.callAfterScroll(
        this.boundMobileScrollHandleFunction_, true);
  }
};
goog.inherits(audioCat.ui.visualization.SectionTimeDomainVisualization,
    audioCat.ui.widget.Widget);

/**
 * Determines the color of the section visualization given the origination of
 * the audio. A static method.
 * @param {audioCat.audio.AudioOrigination} audioOrigination Where the audio
 *     came from.
 * @return {string} The associated hexadecimal color value.
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.determineColor =
    function(audioOrigination) {
  var originations = audioCat.audio.AudioOrigination;
  switch (audioOrigination) {
    case originations.IMPORTED:
      return 'rgba(189, 255, 68, 0.65)'; // A light green.
    case originations.RECORDED:
      return 'rgba(147, 211, 250, 0.65)'; // A light blue.
    case originations.RENDERED:
      return 'rgba(255, 255, 0, 0.65)';
  }
  // A light gray is the default.
  // We should never see it.
  return 'rgba(225, 225, 225, 0.65)';
};

/**
 * How wide each canvas is at max in pixels.
 * @const
 * @type {number}
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.MAX_CANVAS_WIDTH = 800;

/**
 * Updates the displayed time.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    updateTimeDisplay_ = function() {
  this.domHelper_.setTextContent(
      this.timeIndicator_,
      this.timeFormatter_.formatTime(this.section_.getBeginTime()));
};

/**
 * Sets the correct background color for the canvas container.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setCanvasContainerColor_ = function() {
  this.canvasContainer_.style.background =
      audioCat.ui.visualization.SectionTimeDomainVisualization.determineColor(
          this.section_.getAudioChest().getAudioOrigination());
};

/**
 * Sets the display level of the visualization. Determines how far from the top
 * of the track entry to display the visualization.
 * @param {number} displayLevel The display level.
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setDisplayLevel = function(displayLevel) {
  if (this.displayLevel_ != displayLevel) {
    // Only change if there is a need to.
    this.displayLevel_ = displayLevel;
    this.canvasContainer_.style.top = String(displayLevel *
        this.timeDomainScaleManager_.getSectionHeight()) + 'px';
  }
};

/**
 * Sets the correct display CSS height for the canvas container. This could
 * differ from the height canvases are drawing into.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setCanvasContainerHeight_ = function() {
  this.canvasContainer_.style.height =
      String(this.timeDomainScaleManager_.getSectionHeight()) + 'px';
};

/**
 * Redraws and repositions the section visualization using the current scale.
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    redrawAndReposition = function() {
  this.setCorrectLeftDistance_();
  this.drawWaves_();
  // Support horizontal zooming for mobile.
  this.setOuterContainerDimensions_();
};

/**
 * Sets the correct distance from the left in pixels.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setCorrectLeftDistance_ = function() {
  this.setPixelsFromLeft(this.computeCorrectLeftDistance_());
};

/**
 * Computes the correct distance from the left a section should be.
 * @return {number} The correct distance in pixels.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    computeCorrectLeftDistance_ = function() {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  // This distance is due to begin time alone.
  return scale.convertToPixels(this.section_.getBeginTime());
};

/**
 * Handles what happens when the selected state of the section changes.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleSectionMovingStateChange_ = function() {
  this.visualizeMovingState_();
  // TODO(chizeng): Consider changing the play time with the section time.
};

/**
 * Sets the section visualization to reflect whether or not the section is
 * selected.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    visualizeMovingState_ = function() {
  var section = this.section_;
  var movingState = section.getMovingState();
  (movingState ? goog.dom.classes.add : goog.dom.classes.remove)(
      this.canvasContainer_, goog.getCssName('movingSectionContainer'));
};

/**
 * @return {number} The number of pixels from the left the visualization is
 *     positioned.
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    getPixelsFromLeft = function() {
  return this.pixelsFromLeft_;
};

/**
 * Sets the pixels from the left the section visualization should be positioned
 * at. Updates the UI.
 * @param {number} pixelsFromLeft
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setPixelsFromLeft = function(pixelsFromLeft) {
  this.pixelsFromLeft_ = pixelsFromLeft;
  this.canvasContainer_.style.left = String(pixelsFromLeft) + 'px';
};

/**
 * Handles what happens when the begin time of the section changes. Changes the
 * X-position of the visualization when that happens.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleSectionBeginTimeChange_ = function() {
  this.setCorrectLeftDistance_();
  // Update the time shown.
  this.updateTimeDisplay_();
};

/**
 * Handles what happens when the playback rate of the section of audio changes.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handlePlaybackRateChanged_ = function() {
  this.scaleGivenPlaybackRate_();
};

/**
 * Scales all the canvases with CSS with the playback rate.
 * @return {number} The collective CSS width in pixels of the canvases.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    scaleGivenPlaybackRate_ = function() {
  var context2ds = this.context2ds_;

  // Scale the last canvas first since it is the only one that has not maxed out
  // in width.
  var lastIndex = context2ds.length - 1;
  var playbackRate = this.section_.getPlaybackRate();
  var canvas = context2ds[lastIndex].canvas;
  var thisCanvasWidth = this.unscaledLastCanvasWidth_ / playbackRate;
  var collectiveWidth = thisCanvasWidth;
  canvas.style.width = '' + thisCanvasWidth + 'px';
  var canvasHeight = '' + canvas.height + 'px';
  canvas.style.height = canvasHeight;

  for (var i = 0; i < lastIndex; ++i) {
    canvas = context2ds[i].canvas;
    thisCanvasWidth = audioCat.ui.visualization.SectionTimeDomainVisualization
        .MAX_CANVAS_WIDTH / playbackRate;
    collectiveWidth += thisCanvasWidth;
    canvas.style.width = '' + thisCanvasWidth + 'px';
    canvas.style.height = canvasHeight;
  }
  return collectiveWidth;
};

/**
 * Handles what happens when the track of the section changes.
 * @param {!audioCat.state.TrackChangedForSectionEvent} event The event
 *     associated with the track of the section changing.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleTrackChanged_ = function(event) {
  var track = event.getTrack();
  if (track) {
    // The visualization is only visible if there is a track anyway.
    this.track_ = track;
  }
};

/**
 * Handles changes in edit mode.
 * @param {!audioCat.state.editMode.EditModeChangedEvent} event The event
 *     dispatched when the edit mode changes.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleEditModeChange_ = function(event) {
  this.deactivateMode_(event.getPreviousEditMode());
  this.activateMode_(event.getNewEditMode());
};

/**
 * Handles a down press on the visualization of the section in select mode. This
 * corresponds to starting to move the section.
 * @param {!goog.events.BrowserEvent} event The event associated with the down
 *     press.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleDownPressInSelectMode_ = function(event) {
  if (!this.hasDraggerTarget_(event)) {
    event.preventDefault();
    var editModeManager = this.editModeManager_;
    var editMode = /** @type {!audioCat.state.editMode.SelectEditMode} */ (
        editModeManager.getCurrentEditMode());
    var section = this.section_;
    var scale = this.timeDomainScaleManager_.getCurrentScale();
    var domHelper = this.domHelper_;
    var clientXValue = domHelper.obtainClientX(event);
    editMode.setSelectedSections([
        new audioCat.state.editMode.MoveSectionEntry(
            section, this.track_, section.getBeginTime(),
            scale.convertToSeconds(clientXValue),
            clientXValue,
            this.scrollResizeManager_.getLeftRightScroll())
      ]);
    editMode.pressDownInstigated();

    // Listen to move around the document.
    var doc = domHelper.getDocument();
    domHelper.listenForMove(doc, this.handleSectionMoveAround_, false, this);

    // When an up-press is detected on the document once afterwards ...
    domHelper.listenForUpPress(
        doc, this.handleUpPress_, false, this, true);

    section.setMovingState(true);
  }
};

/**
 * Changes the x offset of the section as the user drags it around.
 * @param {!goog.events.BrowserEvent} event The event associated with the
 *     movement.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleSectionMoveAround_ = function(event) {
  event.preventDefault();
  // Get the section being moved.
  var mode = /** {!audioCat.state.editMode.SelectEditMode} */ (
      this.editModeManager_.getCurrentEditMode());
  var sectionEntries = mode.getSelectedSectionEntries();
  var numberOfSectionEntries = sectionEntries.length;

  // For mobile, use elementFromPoint to determine whether we need to switch
  // tracks. Kind of slow ... but this is the only way. For Desktop, this logic
  // is handled in the track entry object when the select mode is activated.
  if (FLAG_MOBILE) {
    var browserTouchEvent =
        /** @type {!TouchEvent} */ (event.getBrowserEvent());
    var touches = browserTouchEvent.changedTouches;
    if (touches.length > 0) {
      var domHelper = this.domHelper_;
      var touch = touches[0];
      // Use clientX and clientY anyway, not the DomHelper helper method since
      // we know we are using mobile now.
      var touchedElement = domHelper.getDocument().elementFromPoint(
          touch.clientX, touch.clientY);
      while (touchedElement) {
        var newTrack = /** @type {audioCat.state.Track|undefined} */ (
            touchedElement[audioCat.ui.tracks.StringConstant.TRACK_OBJECT]);
        if (newTrack) {
          // Check all sections to see if they need to switch tracks.
          for (var i = 0; i < numberOfSectionEntries; ++i) {
            var sectionEntry = sectionEntries[i];
            var section = sectionEntry.getSection();
            var currentSectionTrack = section.getTrack();
            if (currentSectionTrack &&
                currentSectionTrack.getId() != newTrack.getId()) {
              var scrollResizeManager = this.scrollResizeManager_;

              // Do not compute the horizontal scroll while in limbo (ie, while
              // section is being switched).
              scrollResizeManager.setIsGoodTimeForScrollCompute(false);

              // Switch the track of the section.
              // Remove the section from the previous track.
              currentSectionTrack.removeSection(section);

              // Add the section to this track.
              newTrack.addSection(section);

              // Re-allow horizontal scroll computations.
              scrollResizeManager.setIsGoodTimeForScrollCompute(false);
            }
          }
          // Already found new track. Don't check further up the DOM tree.
          break;
        }
        touchedElement = domHelper.getParentElement(touchedElement);
      }
    }
  }

  var timeDomainScaleManager = this.timeDomainScaleManager_;
  var scale = timeDomainScaleManager.getCurrentScale();
  var scrollX = this.scrollResizeManager_.getLeftRightScroll();
  for (var i = 0; i < numberOfSectionEntries; ++i) {
    var sectionEntry = sectionEntries[i];
    var section = sectionEntry.getSection();

    // Compute the delta of the mouse X.
    var originalBeginTime = sectionEntry.getBeginTime();

    // Convert the delta to a time delta.
    // Take into account changes in clientX and scroll.
    var changeInTimeValue = scale.convertToSeconds(
        this.domHelper_.obtainClientX(event) - sectionEntry.getBeginClientX() +
            scrollX - sectionEntry.getBeginScrollX());

    // TODO(chizeng): To fix moving and zooming at the same time, compute using
    // time information first. Then, compute back into pixels. This involves
    // storing the initial scale.

    var sectionOriginalTimeOffset = sectionEntry.getTimeOffset();
    var newBeginTime = sectionEntry.getBeginTime() + changeInTimeValue;

    if (mode.getSnapToGridState()) {
      // We must snap the computed time to the grid.
      var intervalSeconds;
      if (timeDomainScaleManager.getDisplayAudioUsingBars()) {
        // Snap to the time interval that is a single beat. Tempo is beats/min.
        intervalSeconds = 60 /
            timeDomainScaleManager.getSignatureTempoManager().getTempo();
      } else {
        // Snap to the time interval that is a single minor tick.
        var majorTickTime = scale.getMajorTickTime();
        var timeConversion = 0;
        var timeUnit = scale.getTimeUnit();
        if (timeUnit == audioCat.ui.visualization.TimeUnit.S) {
          timeConversion = 1; // 1 second in a second.
        } else if (timeUnit == audioCat.ui.visualization.TimeUnit.MS) {
          timeConversion = 1000; // 1000 ms in a second.
        }
        var minorsPerMajorTick = scale.getMinorTicksPerMajorTick();

        // Minor ticks per major tick actually refers to the number of lines to
        // draw in a major tick that represent minor ticks.
        intervalSeconds =
            majorTickTime / timeConversion / (minorsPerMajorTick + 1);
      }
      // Floor to the previous interval matching value.
      newBeginTime =
          Math.floor(newBeginTime / intervalSeconds) * intervalSeconds;
    }

    // Clamp the time sum so it never goes under 0.
    newBeginTime = Math.max(newBeginTime, 0);

    // Set the section's begin time to this new value.
    section.setBeginTime(newBeginTime);
  }
  this.setOuterContainerDimensions_();
};

/**
 * Handles what do to once the user lifts the mouse.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleUpPress_ = function() {
  var domHelper = this.domHelper_;
  var doc = domHelper.getDocument();
  domHelper.unlistenForMove(doc, this.handleSectionMoveAround_, false, this);
  // Empty selected tracks.
  var editMode = /** @type {!audioCat.state.editMode.SelectEditMode} */ (
      this.editModeManager_.getCurrentEditMode());
  editMode.confirmSectionMovement();
  // TODO(chizeng): Verify if we really want to unselect ALL sections here.
  editMode.setSelectedSections([]);
  this.section_.setMovingState(false);
};

/**
 * Handles what happens when the user clicks on a section in remove section
 * mode. The section gets removed from its track.
 * @param {!goog.events.BrowserEvent} e The event.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handlePressInRemoveSectionMode_ = function(e) {
  if (!this.hasDraggerTarget_(e)) {
    var editMode =
        /** @type {!audioCat.state.editMode.SectionRemoveMode} */ (
            this.editModeManager_.getCurrentEditMode());

    // Issues the command (so it's stored in history) to remove the section.
    editMode.removeSection(this.section_);
  }
};

/**
 * Deactivates an edit mode.
 * @param {!audioCat.state.editMode.EditMode} mode The edit mode to deactivate.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    activateMode_ = function(mode) {
  var domHelper = this.domHelper_;
  var domElement = this.canvasContainer_;
  var editModeName = mode.getName();
  var specificMode;
  switch (editModeName) {
    case audioCat.state.editMode.EditModeName.DUPLICATE_SECTION:
      domHelper.listenForPress(domElement,
          this.handlePressInDuplicateSectionMode_, false, this);
      this.setVisualizeDuplicateSectionMode_(true);
      break;
    case audioCat.state.editMode.EditModeName.REMOVE_SECTION:
      domHelper.listenForPress(domElement,
          this.handlePressInRemoveSectionMode_, false, this);
      this.setVisualizeRemoveSectionMode_(true);
      break;
    case audioCat.state.editMode.EditModeName.SELECT:
      specificMode = /** @type {!audioCat.state.editMode.SelectEditMode} */ (
          mode);
      // Listen to mouse downs on the visualization of the audio section.
      domHelper.listenForDownPress(domElement,
          this.handleDownPressInSelectMode_, false, this);
      break;
    case audioCat.state.editMode.EditModeName.SPLIT_SECTION:
      // Listen for clicks - we should split the section on clicks.
      domHelper.listenForUpPress(domElement,
          this.handlePressInSectionSplitMode_, false, this);
      this.setVisualizeSectionSplitMode_(true);
      break;
  }
};

/**
 * Deactivates an edit mode.
 * @param {!audioCat.state.editMode.EditMode} mode The edit mode to deactivate.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    deactivateMode_ = function(mode) {
  var domHelper = this.domHelper_;
  var editModeName = mode.getName();
  var specificMode;
  var domElement = this.canvasContainer_;
  switch (editModeName) {
    case audioCat.state.editMode.EditModeName.DUPLICATE_SECTION:
      domHelper.unlistenForPress(domElement,
          this.handlePressInDuplicateSectionMode_, false, this);
      this.setVisualizeDuplicateSectionMode_(false);
      break;
    case audioCat.state.editMode.EditModeName.REMOVE_SECTION:
      domHelper.unlistenForPress(domElement,
          this.handlePressInRemoveSectionMode_, false, this);
      this.setVisualizeRemoveSectionMode_(false);
      break;
    case audioCat.state.editMode.EditModeName.SELECT:
      domHelper.unlistenForDownPress(
          domElement, this.handleDownPressInSelectMode_, false, this);
      break;
    case audioCat.state.editMode.EditModeName.SPLIT_SECTION:
      domHelper.unlistenForUpPress(domElement,
          this.handlePressInSectionSplitMode_, false, this);
      this.setVisualizeSectionSplitMode_(false);
      break;
  }
};

/**
 * Handles duplicating a section when the user clicks on the section during
 * duplicate section mode.
 * @param {!goog.events.BrowserEvent} event The relevant event.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handlePressInDuplicateSectionMode_ = function(event) {
  if (!this.hasDraggerTarget_(event)) {
    event.preventDefault();
    var editMode =
        /** @type {!audioCat.state.editMode.DuplicateSectionMode} */ (
            this.editModeManager_.getCurrentEditMode());
    editMode.duplicateSection(this.section_);
  }
};

/**
 * Determines whether an event originally propagated from the dragger that lets
 * the user adjust speed.
 * @param {!goog.events.Event} event The event.
 * @return {boolean} Whether the dragger was the specific target.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    hasDraggerTarget_ = function(event) {
  return !!this.sectionSpeedDragger_ &&
      event.target == this.sectionSpeedDragger_.getDom();
};

/**
 * Handles what happens when a user clicks on a section in section split mode.
 * @param {!goog.events.BrowserEvent} event The relevant event.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handlePressInSectionSplitMode_ = function(event) {
  if (this.hasDraggerTarget_(event)) {
    return;
  }

  event.preventDefault();
  var mode = /** @type {!audioCat.state.editMode.SectionSplitMode} */ (
      this.editModeManager_.getCurrentEditMode());

  this.turnOffLineMarkingTimeInSection_();

  // TODO(chizeng): Split the section, but do so in a way that allows us to copy
  // the contents of the section's canvases to the new canvases. That way, we
  // don't have to redraw the canvases.

  var domHelper = this.domHelper_;
  var domElement = this.canvasContainer_;
  var visualizationOffset = goog.style.getPageOffsetLeft(domElement);
  var clickOffset = this.domHelper_.obtainClientX(event);
  if (!FLAG_MOBILE) {
    // If we're not mobile, we don't need to take out the left-right scroll.
    clickOffset += this.scrollResizeManager_.getLeftRightScroll();
  }
  var withinOffset = clickOffset - visualizationOffset;
  var offsetInSeconds = this.timeDomainScaleManager_.getCurrentScale()
      .convertToSeconds(withinOffset);
  mode.splitSection(this.section_, offsetInSeconds);
};

/**
 * Sets whether the visualizer should reflect that we're in duplicate section
 * mode, in which the user can duplicate sections by clicking on them.
 * @param {boolean} status Whether we are in duplicate section mode.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setVisualizeDuplicateSectionMode_ = function(status) {
  (status ? goog.dom.classes.add : goog.dom.classes.remove)(
      this.canvasContainer_, goog.getCssName('duplicateSectionMode'));
};

/**
 * Sets whether the visualizer should reflect that we're in section split mode.
 * @param {boolean} sectionSplitModeStatus Whether we are in section split mode.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setVisualizeSectionSplitMode_ = function(sectionSplitModeStatus) {
  var canvasContainer = this.canvasContainer_;
  if (sectionSplitModeStatus) {
    goog.dom.classes.add(canvasContainer, goog.getCssName('splitModeSection'));
    this.turnOnLineMarkingTimeInSection_();
  } else {
    goog.dom.classes.remove(
        canvasContainer, goog.getCssName('splitModeSection'));
    this.turnOffLineMarkingTimeInSection_();
  }
};

/**
 * Turns on the line marking the place where the user is hovering over the
 * section.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    turnOnLineMarkingTimeInSection_ = function() {
  var domHelper = this.domHelper_;
  var canvasContainer = this.canvasContainer_;
  domHelper.listenForMove(canvasContainer, this.handleMouseMoveInSplitMode_,
      false, this);
  // Hide the line marking time when the user mouses out.
  domHelper.listenForMouseOut(canvasContainer,
      this.hideLineMarkingTimeInSection_, false, this);

  // Display the line marking time when the user mouses in.
  domHelper.listenForMouseOver(canvasContainer,
      this.displayLineMarkingTimeInSection_, false, this);
};

/**
 * Appends the line marking time to the canvas container.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    displayLineMarkingTimeInSection_ = function() {
  this.domHelper_.appendChild(
      this.canvasContainer_, this.lineMarkingTimeInSection_);
};

/**
 * Removes the line marking time from the canvas container.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    hideLineMarkingTimeInSection_ = function() {
  this.domHelper_.removeNode(this.lineMarkingTimeInSection_);
};

/**
 * Turns off the line marking the place where the user is hovering over the
 * section.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    turnOffLineMarkingTimeInSection_ = function() {
  var domHelper = this.domHelper_;
  this.hideLineMarkingTimeInSection_();
  var canvasContainer = this.canvasContainer_;
  domHelper.unlistenForMove(canvasContainer,
      this.handleMouseMoveInSplitMode_, false, this);

  domHelper.unlistenForMouseOut(canvasContainer,
      this.hideLineMarkingTimeInSection_, false, this);
  domHelper.unlistenForMouseOver(canvasContainer,
      this.displayLineMarkingTimeInSection_, false, this);
};

/**
 * Handles mouse move in split mode. Makes the line follow the cursor.
 * @param {!goog.events.BrowserEvent} e The move event.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleMouseMoveInSplitMode_ = function(e) {
  if (!this.hasDraggerTarget_(e)) {
    e.preventDefault();
    this.displayLineMarkingTimeInSection_();
    var lineLeftValue = this.domHelper_.obtainClientX(e) -
        goog.style.getPageOffsetLeft(this.canvasContainer_);
    if (!FLAG_MOBILE) {
      // Account for scrolling iff we are not implementing our own scrolling,
      // which we do for mobile.
      lineLeftValue += this.scrollResizeManager_.getLeftRightScroll();
    }
    this.lineMarkingTimeInSection_.style.left = String(lineLeftValue) + 'px';
  }
};

/**
 * Sets whether the visualizer should reflect that we're in section remove mode.
 * @param {boolean} status Whether we are in section remove mode.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setVisualizeRemoveSectionMode_ = function(status) {
  var functionToUse = status ? goog.dom.classes.add : goog.dom.classes.remove;
  functionToUse(
      this.canvasContainer_, goog.getCssName('sectionRemoveModeSection'));
};

/**
 * Initializes the canvas. Draws the full wave form.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.drawWaves_ =
    function() {
  // Update the ID of rendering so we can cancel if we're performing an
  // outdated render operation.
  this.drawId_ = this.idGenerator_.obtainUniqueId();
  var drawId = this.drawId_;

  var domHelper = this.domHelper_;
  var canvasContainer = this.canvasContainer_;
  var context2dPool = this.context2dPool_;
  var context2ds = this.context2ds_;
  // Remove all canvases. Return them.
  for (var i = 0; i < context2ds.length; ++i) {
    var context2d = context2ds[i];
    context2dPool.return2dContext(context2d);
    domHelper.removeNode(context2d.canvas);
  }
  context2ds.length = 0;

  var section = this.section_;
  var numberOfClips = section.getNumberOfClips();
  if (numberOfClips == 0) {
    // No clips to render.
    return;
  }

  var maxCanvasWidth =
      audioCat.ui.visualization.SectionTimeDomainVisualization.MAX_CANVAS_WIDTH;
  var scale = this.timeDomainScaleManager_.getCurrentScale();

  // Compute total width of the section visualization.
  var timeConversion = 0;
  var timeUnit = scale.getTimeUnit();
  if (timeUnit == audioCat.ui.visualization.TimeUnit.S) {
    timeConversion = 1; // 1 second in a second.
  } else if (timeUnit == audioCat.ui.visualization.TimeUnit.MS) {
    timeConversion = 1000; // 1000 ms in a second.
  }

  // Compute width required to represent entire audio. Round up.
  var sectionDuration = section.getPlaybackRate1Duration();
  var widthForWholeSection = Math.ceil(sectionDuration * timeConversion *
      scale.getMajorTickWidth() / scale.getMajorTickTime());

  // Create canvases.
  var totalCanvasHeight = 100; // Arbitrary. Small enough to render quickly.
  // Will get resized by CSS anyway based on the time domain scale manager.

  var numberCanvasesNeeded = Math.ceil(widthForWholeSection / maxCanvasWidth);
  var lastContextIndex = numberCanvasesNeeded - 1;
  var new2dContext;
  var new2dContextCanvas;
  for (var i = 0; i < lastContextIndex; ++i) {
    new2dContext = context2dPool.retrieve2dContext();
    new2dContextCanvas = new2dContext.canvas;
    new2dContextCanvas.width = maxCanvasWidth;
    new2dContextCanvas.height = totalCanvasHeight;
    context2ds.push(new2dContext);
    new2dContext.beginPath();
    domHelper.appendChild(canvasContainer, new2dContextCanvas);
  }
  new2dContext = context2dPool.retrieve2dContext();
  new2dContextCanvas = new2dContext.canvas;
  this.unscaledLastCanvasWidth_ = widthForWholeSection % maxCanvasWidth;
  new2dContextCanvas.width = this.unscaledLastCanvasWidth_;
  new2dContextCanvas.height = totalCanvasHeight;
  context2ds.push(new2dContext);
  new2dContext.beginPath();
  domHelper.appendChild(canvasContainer, new2dContextCanvas);

  var sampleRate = section.getSampleRate();
  var approxNumberOfSamplesInSection = sectionDuration * sampleRate;

  // Compute the number of samples each pixel represents in interval_size.
  var samplesPerPixel = Math.ceil(
      approxNumberOfSamplesInSection / widthForWholeSection);

  // How many samples to consider per pixel.
  // Higher values yield greater resolution, but slower speed.
  var samplesToTake = 30;

  var channelHeight = Math.floor(
      totalCanvasHeight / section.getNumberOfChannels());
  var halfChannelHeight = Math.floor(channelHeight / 2);
  var midline = halfChannelHeight;

  // Compute the total sample length.
  var totalSampleLength = 0;
  for (var i = 0; i < section.getNumberOfClips(); ++i) {
    var clip = section.getClipAtIndex(i);
    totalSampleLength +=
        clip.getRightSampleBound() - clip.getBeginSampleIndex();
  }
  totalSampleLength = Math.min(
      totalSampleLength, approxNumberOfSamplesInSection);

  // Compute how many samples each pixel represents. Note that this number
  // differs from the 
  var computedSamplesPerPixel = totalSampleLength / widthForWholeSection;

  // Consider the playback rate by altering CSS.
  var collectiveCssWidth = this.scaleGivenPlaybackRate_();
  if (collectiveCssWidth > audioCat.ui.visualization.SectionSpeedDragger.
      MIN_VISUALIZATION_WIDTH_FOR_SHOW) {
    // The collective visualization is long enough for us to show the dragger.
    if (!this.sectionSpeedDragger_) {
      this.sectionSpeedDragger_ =
          new audioCat.ui.visualization.SectionSpeedDragger(
              this.domHelper_, this.section_, this.canvasContainer_,
              this.commandManager_, this.idGenerator_);
      domHelper.appendChild(
          this.canvasContainer_, this.sectionSpeedDragger_.getDom());
    }
  } else {
    this.sectionSpeedDragger_ = null;
  }

  var canvasIndex = 0;
  var context = context2ds[canvasIndex];
  var pixelIndex = 0;
  var overallSampleIndex = 0;
  var clipIndex = 0;
  var clip = section.getClipAtIndex(clipIndex);
  var withinClipSampleIndex = clip.getBeginSampleIndex();
  var minSample = 0;
  var maxSample = 0;
  var sampleIncrement = Math.floor(computedSamplesPerPixel / samplesToTake);
  var channelIndex = 0;
  var channelMins = new Array(section.getNumberOfChannels());
  var channelMaxes = new Array(section.getNumberOfChannels());
  for (var i = 0; i < channelMins.length; ++i) {
    channelMins[i] = 0;
    channelMaxes[i] = 0;
  }
  var generateWaveForms = goog.bind(function() {
    if (this.drawId_ != drawId) {
      // This generation of wave forms is outdated.
      return;
    }

    while (overallSampleIndex < totalSampleLength) {
      if (clipIndex >= section.getNumberOfClips()) {
        // No more clips to render.
        break;
      }
      clip = section.getClipAtIndex(clipIndex);
      withinClipSampleIndex = clip.getBeginSampleIndex();
      while (withinClipSampleIndex < clip.getRightSampleBound()) {
        // For all channels,
        while (channelIndex < section.getNumberOfChannels()) {
          // Get the samples for all channels.
          var sample = section.getSampleAtIndex(
              channelIndex, withinClipSampleIndex);

          // Update mins and maxes of samples in this pixel.
          channelMins[channelIndex] =
              Math.min(channelMins[channelIndex], sample);
          channelMaxes[channelIndex] =
              Math.max(channelMaxes[channelIndex], sample);
          channelIndex++;
        }
        channelIndex = 0;

        // Update sample count.
        overallSampleIndex += sampleIncrement;
        withinClipSampleIndex += sampleIncrement;

        // Check if we finished computing 1 pixel of samples.
        var localPixelIndex = Math.floor(
            overallSampleIndex / computedSamplesPerPixel);
        if (localPixelIndex > pixelIndex) {
          // Create the lines.
          var canvasPixelIndex = pixelIndex % maxCanvasWidth;

          // For each channel, move to the right vertical position. Make curve.
          for (var c = 0; c < section.getNumberOfChannels(); ++c) {
            var localMidline = c * channelHeight + halfChannelHeight;
            context.moveTo(canvasPixelIndex + 0.5,
                localMidline - halfChannelHeight * channelMaxes[c]);
            context.lineTo(canvasPixelIndex + 0.5,
                localMidline - halfChannelHeight * channelMins[c]);
          }

          // Update the pixel index.
          pixelIndex = localPixelIndex;

          // Reset channel min / max calculations.
          for (var i = 0; i < channelMins.length; ++i) {
            channelMins[i] = 0;
            channelMaxes[i] = 0;
          }

          // Possibly update which canvas to draw on. If we are to update, draw.
          // Also if we are to update, use a set timeout so that we do not have
          // 1 really long-lasting function.
          if (localPixelIndex >=
              canvasIndex * maxCanvasWidth + context.canvas.width) {
            // Render.
            context.clearRect(
                0, 0, context.canvas.width, context.canvas.height);
            context.closePath();
            context.strokeStyle = '#000';
            context.stroke();

            // Update the context we are drawing on.
            canvasIndex++;
            if (canvasIndex < context2ds.length) {
              // Set a new timeout we are not done yet.
              context = context2ds[canvasIndex];
              context.beginPath();
              goog.global.setTimeout(generateWaveForms, 1);
            }
          }
        }
      }
      clipIndex++;
    }
  }, this);

  // Store mins and maxes.
  // var mins = new Float32Array(widthForWholeSection, 1.0);
  // var maxes = new Float32Array(widthForWholeSection, -1.0);
  // var numberOfChannels = section.getNumberOfChannels();

  // var channelHeight = Math.floor(totalCanvasHeight / numberOfChannels);
  // var halfChannelHeight = Math.floor(channelHeight / 2);
  // var midline = halfChannelHeight;

  // for (var channelIndex = 0; channelIndex < numberOfChannels; ++channelIndex) {
  //   // Store a current clip.
  //   var clipIndex = 0;
  //   var clip = section.getClipAtIndex(clipIndex);

  //   // Iterate through each pixel in the width.
  //   var accumulatedSampleCount = section.getBeginAudioChestSampleIndex();
  //   var doneComputingMinsMaxes = false;
  //   for (var pixelIndex = 0; pixelIndex < widthForWholeSection; ++pixelIndex) {
  //     // Compute a scaled base sample value. Add in the accumulated value.
  //     var baseSampleIndex = Math.floor(
  //         pixelIndex * approxNumberOfSamplesInSection / widthForWholeSection) +
  //             accumulatedSampleCount;

  //     for (var randomSampleIndex = 0; randomSampleIndex < samplesToTake;
  //         ++randomSampleIndex) {
  //       var sampleIndex = baseSampleIndex +
  //           Math.floor(samplesPerPixel * randomSampleIndex / samplesToTake);
  //       // Advance to the next clip if necessary.
  //       while (clip.getRightSampleBound() <= sampleIndex) {
  //         ++clipIndex;
  //         if (clipIndex >= numberOfClips) {
  //           doneComputingMinsMaxes = true;
  //           break;
  //         }
  //         var nextClip = section.getClipAtIndex(clipIndex);
  //         accumulatedSampleCount +=
  //             nextClip.getBeginSampleIndex() - clip.getRightSampleBound();
  //         clip = nextClip;
  //       }
  //       if (doneComputingMinsMaxes) {
  //         break;
  //       }

  //       // Get the sample value.
  //       var sampleValue = section.getSampleAtIndex(channelIndex, sampleIndex);
  //       // Set the new min / max found for the segment if necessary.
  //       if (sampleValue < mins[pixelIndex]) {
  //         mins[pixelIndex] = sampleValue;
  //       }
  //       if (sampleValue > maxes[pixelIndex]) {
  //         maxes[pixelIndex] = sampleValue;
  //       }
  //     }
  //     if (doneComputingMinsMaxes) {
  //       break;
  //     }
  //   }

  //   // Create the paths for the waveform.
  //   var pixelIndex = 0;
  //   for (var canvasIndex = 0; canvasIndex < numberCanvasesNeeded;
  //       ++canvasIndex) {
  //     for (var perCanvasPixelIndex = 0; perCanvasPixelIndex < maxCanvasWidth;
  //         ++perCanvasPixelIndex) {
  //       var context2d = context2ds[canvasIndex];
  //       var perCanvasPixelIndexFrontHalf = perCanvasPixelIndex + 0.5;
  //       context2d.moveTo(perCanvasPixelIndexFrontHalf,
  //           midline - mins[pixelIndex] * halfChannelHeight);
  //       context2d.lineTo(perCanvasPixelIndexFrontHalf,
  //           midline - maxes[pixelIndex] * halfChannelHeight);

  //       // Reset the min and max.
  //       mins[pixelIndex] = 1.0;
  //       maxes[pixelIndex] = -1.0;

  //       ++pixelIndex;
  //     }
  //   }

  //   // Update canvas draw settings.
  //   midline += channelHeight;
  // }

  goog.global.setTimeout(generateWaveForms, 0);
};

/**
 * Cleans up the visualization to conserve memory. For instance, this method
 * puts the contexts back into the pool.
 * @override
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.cleanUp =
    function() {
  var unlistenFunction = goog.events.unlisten;
  var section = this.section_;
  var editModeManager = this.editModeManager_;
  unlistenFunction(section, audioCat.state.events.TRACK_CHANGED_FOR_SECTION,
      this.handleTrackChanged_, false, this);
  unlistenFunction(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
      this.handleEditModeChange_, false, this);
  unlistenFunction(section,
      audioCat.state.events.SECTION_BEGIN_TIME_CHANGED,
      this.handleSectionBeginTimeChange_, false, this);
  unlistenFunction(section, audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);
  if (FLAG_MOBILE) {
    this.scrollResizeManager_.removeCallAfterScroll(
        this.boundMobileScrollHandleFunction_);
  }

  // Return all the contexts.
  goog.dom.removeChildren(this.canvasContainer_);
  var context2dPool = this.context2dPool_;
  var context2ds = this.context2ds_;
  var numberOfContexts = context2ds.length;
  for (var i = 0; i < numberOfContexts; ++i) {
    context2dPool.return2dContext(context2ds[i]);
  }

  // Clean up the dragger that lets the user adjust speed.
  if (this.sectionSpeedDragger_) {
    this.sectionSpeedDragger_.cleanUp();
    this.sectionSpeedDragger_ = null;
  }

  audioCat.ui.visualization.SectionTimeDomainVisualization.base(
      this, 'cleanUp');
};

/**
 * Sets the left offset and width of the outer container (the container of the
 * container of canvases) so that part of it still reaches its original
 * position, allowing for the application to fully scroll.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    setOuterContainerDimensions_ = function() {
  if (FLAG_MOBILE) {
    // For mobile browsers, make up for scrolling distance. Otherwise, the width
    // of the app container shrinks since we move elements leftward.
    var scrollDistance = this.scrollResizeManager_.getLeftRightScroll();
    // This width should be large enough to make the browser not reduce width.
    var totalWidth = scrollDistance +
        this.computeCorrectLeftDistance_() + this.canvasContainer_.clientWidth;
    var container = this.getDom();
    container.style.width = '' + totalWidth + 'px';
    container.style.left = '-' + scrollDistance + 'px';
  }
};

/**
 * Sets the dimensions of the outer container so that this section visualization
 * could contribute to the overall scroll width of the application, allowing us
 * to properly implement horizontal scrolling. Call this as soon as this element
 * is appended to the DOM.
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    rectifyDimensions = function() {
  // Set the right outer dimensions for scrolling.
  this.setOuterContainerDimensions_();
};

/**
 * Handles scrolling for mobile browers, which we implement on our own.
 * @private
 */
audioCat.ui.visualization.SectionTimeDomainVisualization.prototype.
    handleScrollForMobile_ = function() {
  this.setOuterContainerDimensions_();
};
