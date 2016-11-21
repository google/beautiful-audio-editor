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
goog.provide('audioCat.ui.visualization.SectionSpeedDragger');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.command.AlterSectionSpeedCommand');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.widget.Widget');
goog.require('audioCat.utility.EventHandler');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.style');


/**
 * Lets the user alter the speed of a section by dragging on it.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.Section} section The section of audio to visualize.
 * @param {!Element} sectionElement The element that visualizes the section.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands so that the user can undo and redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.visualization.SectionSpeedDragger = function(
    domHelper, section, sectionElement, commandManager, idGenerator) {
  goog.base(this, domHelper.createDiv(goog.getCssName('sectionSpeedDragger')));

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The left pixel boundary in the viewport that cannot be crossed by the left
   * side of the section speed dragger element.
   * @private {number}
   */
  this.leftPixelBoundary_ = 0;

  /**
   * The clientX of the mouse upon the last downpress.
   * @private {number}
   */
  this.lastDownPressClientX_ = 0;

  /**
   * The width of the section visualization at the start of the last drag.
   * @private {number}
   */
  this.lastBeginDragSectionWidth_ = 0;

  /**
   * The element for the collective visualization of the section.
   * @private {!Element}
   */
  this.sectionElement_ = sectionElement;

  /**
   * The left boundary of the dragger upon the start of the last drag.
   * @private {number}
   */
  this.lastLeftBoundary_ = 0;

  /**
   * The playback rate at the start of the last drag.
   * @private {number}
   */
  this.lastPlaybackRate_ = 0;

  // When the playback rate changes, add an outline to the dragger. Orange if
  // the new playback rate is greater than 1. Blue if the new playback rate is
  // less than 1. No outline if the new playback rate is 1.
  goog.events.listen(section, audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);
  this.setOutlineBasedOnPlaybackRate_();

  domHelper.listenForDownPress(
      this.getDom(), this.handleDownPress_, false, this);
};
goog.inherits(audioCat.ui.visualization.SectionSpeedDragger,
    audioCat.ui.widget.Widget);


/**
 * The min width (in pixels) of the collective section visualization required
 * for the speed dragger to appear.
 * @const {number}
 */
audioCat.ui.visualization.SectionSpeedDragger.MIN_VISUALIZATION_WIDTH_FOR_SHOW =
    10;


/**
 * Handles a change in playback rate.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.
    handlePlaybackRateChanged_ = function() {
  this.setOutlineBasedOnPlaybackRate_();
};

/**
 * Sets the outline of the dragger based on the playback rate of the section.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.
    setOutlineBasedOnPlaybackRate_ = function() {
  var playbackRate = this.section_.getPlaybackRate();
  var defaultPlaybackRate = audioCat.audio.Constant.DEFAULT_PLAYBACK_RATE;
  var fasterClass = goog.getCssName('quickenedDragger');
  var slowerClass = goog.getCssName('slowedDragger');
  if (playbackRate > defaultPlaybackRate) {
    // Faster than default.
    goog.dom.classes.add(this.getDom(), fasterClass);
    goog.dom.classes.remove(this.getDom(), slowerClass);
  } else if (playbackRate < defaultPlaybackRate) {
    // Slower than default.
    goog.dom.classes.add(this.getDom(), slowerClass);
    goog.dom.classes.remove(this.getDom(), fasterClass);
  } else {
    // Exactly the default.
    goog.dom.classes.remove(this.getDom(), fasterClass);
    goog.dom.classes.remove(this.getDom(), slowerClass);
  }
};

/**
 * Handles a downpress.
 * @param {!goog.events.BrowserEvent} e The downpress event.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.handleDownPress_ =
    function(e) {
  e.stopPropagation();
  this.lastDownPressClientX_ = this.domHelper_.obtainClientX(e);
  this.lastLeftBoundary_ = goog.style.getPageOffsetLeft(this.getDom());
  this.leftPixelBoundary_ = goog.style.getPageOffsetLeft(this.sectionElement_);
  this.lastBeginDragSectionWidth_ = this.sectionElement_.clientWidth;
  this.lastPlaybackRate_ = this.section_.getPlaybackRate();
  this.beginDrag_();
};

/**
 * Begins a drag.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.beginDrag_ =
    function() {
  // Listen for moving around.
  var domHelper = this.domHelper_;
  domHelper.listenForMove(
      domHelper.getDocument(), this.handleMoveDuringDrag_, false, this);

  // Listen for stopping dragging.
  domHelper.listenForUpPress(
      domHelper.getDocument(), this.endDrag_, false, this);
};

/**
 * Handles the cursor moving during a drag.
 * @param {!goog.events.BrowserEvent} e The move event.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.handleMoveDuringDrag_ =
    function(e) {
  var domHelper = this.domHelper_;
  var deltaX = domHelper.obtainClientX(e) - this.lastDownPressClientX_;
  // Do not let the speed get too fast. Or become negative. At least have enough
  // room in the visualization to display the speed dragger.
  var newWidth = Math.max(
      audioCat.ui.visualization.SectionSpeedDragger.
          MIN_VISUALIZATION_WIDTH_FOR_SHOW,
      this.lastBeginDragSectionWidth_ + deltaX);
  this.section_.setPlaybackRate(
      this.lastPlaybackRate_ * this.lastBeginDragSectionWidth_ / newWidth);
};

/**
 * Ends a drag.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.endDrag_ =
    function() {
  this.unlistenDragEvents_();

  // Enqueue a command for changing the playback rate.
  var newPlaybackRate = this.section_.getPlaybackRate();
  if (newPlaybackRate != this.lastPlaybackRate_) {
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.AlterSectionSpeedCommand(
            this.section_,
            this.lastPlaybackRate_,
            newPlaybackRate,
            this.idGenerator_),
        true);
  }
};

/**
 * Stops listening for events that occur during a drag.
 * @private
 */
audioCat.ui.visualization.SectionSpeedDragger.prototype.unlistenDragEvents_ =
    function() {
  var domHelper = this.domHelper_;
  domHelper.unlistenForMove(
      domHelper.getDocument(), this.handleMoveDuringDrag_, false, this);
  domHelper.unlistenForUpPress(
      domHelper.getDocument(), this.endDrag_, false, this);
};

/** @override */
audioCat.ui.visualization.SectionSpeedDragger.prototype.cleanUp = function() {
  this.domHelper_.unlistenForDownPress(
      this.getDom(), this.handleDownPress_, false, this);
  goog.events.unlisten(this.section_,
      audioCat.state.events.PLAYBACK_RATE_CHANGED,
      this.handlePlaybackRateChanged_, false, this);
  this.unlistenDragEvents_();
  audioCat.ui.visualization.SectionSpeedDragger.base(this, 'cleanUp');
};
