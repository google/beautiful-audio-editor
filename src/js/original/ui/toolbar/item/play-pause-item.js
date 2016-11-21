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
goog.provide('audioCat.ui.toolbar.item.PlayPauseItem');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A toolbar item for downloading the project as a WAVE file.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.PlayPauseItem = function(
    domHelper,
    editModeManager,
    playManager,
    actionManager,
    toolTip) {

  var internalDom = domHelper.createElement('div');
  goog.dom.classes.add(
      internalDom, goog.getCssName('playPauseItemInternalDom'));

  var playIcon = audioCat.ui.toolbar.item.Item.createIcon(
      domHelper, 'images/play.svg');
  goog.dom.classes.add(playIcon, goog.getCssName('playIcon'));
  domHelper.appendChild(internalDom, playIcon);

  var pauseIcon = audioCat.ui.toolbar.item.Item.createIcon(
      domHelper, 'images/pause.svg');
  goog.dom.classes.add(pauseIcon, goog.getCssName('pauseIcon'));
  domHelper.appendChild(internalDom, pauseIcon);

  /**
   * The internal DOM of the item. This DOM is special in that it contains both
   * icons, but determines which one to display using CSS.
   * @private {!Element}
   */
  this.internalDom_ = internalDom;

  // The base constructor must be called only after the internal DOM is defined.
  goog.base(this, domHelper, editModeManager, actionManager, toolTip, '');

  // Listen to changes in play state (if we pause or begin play).
  goog.events.listen(playManager, audioCat.audio.play.events.PLAY_BEGAN,
      this.handleChangeInPlayState_, false, this);
  goog.events.listen(playManager, audioCat.audio.play.events.PAUSED,
      this.handleChangeInPlayState_, false, this);

  // Initialize based on whether we are currently playing.
  // We either display the play icon or the pause icon.
  this.determineVisuals_(playManager);
  this.setProperDescription_(playManager);
};
goog.inherits(
    audioCat.ui.toolbar.item.PlayPauseItem, audioCat.ui.toolbar.item.Item);

/** @override */
audioCat.ui.toolbar.item.PlayPauseItem.prototype.getInternalDom = function() {
  return this.internalDom_;
};

/**
 * Sets the description based on whether we're playing.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages play.
 * @private
 */
audioCat.ui.toolbar.item.PlayPauseItem.prototype.setProperDescription_ =
    function(playManager) {
  this.setDescription('Click to ' +
      (playManager.getPlayState() ? 'pause' : 'play') +
      ' (Keyboard shortcut: spacebar).');
};

/**
 * Handles a change in play state (either playing began or paused).
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.toolbar.item.PlayPauseItem.prototype.handleChangeInPlayState_ =
    function(event) {
  var playManager =
      /** @type {!audioCat.audio.play.PlayManager} */ (event.target);
  this.determineVisuals_(playManager);
  this.setProperDescription_(playManager);
};

/**
 * Alters the visuals of the item based on whether we are currently playing.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages play.
 * @private
 */
audioCat.ui.toolbar.item.PlayPauseItem.prototype.determineVisuals_ =
    function(playManager) {
  var playState = playManager.getPlayState();
  var internalDom = this.internalDom_;
  var domHelper = this.domHelper;
  if (playState) {
    // We are currently playing.
    domHelper.unlistenForUpPress(
        this.getDom(), playManager.play, false, playManager);
    domHelper.listenForUpPress(
        this.getDom(), playManager.pause, false, playManager);
    goog.dom.classes.add(internalDom, goog.getCssName('currentlyPlaying'));
    this.setAriaLabel('Pause.');
  } else {
    // We are currently not playing.
    domHelper.unlistenForUpPress(
        this.getDom(), playManager.pause, false, playManager);
    domHelper.listenForUpPress(
        this.getDom(), playManager.play, false, playManager);
    goog.dom.classes.remove(internalDom, goog.getCssName('currentlyPlaying'));
    this.setAriaLabel('Play.');
  }
};
