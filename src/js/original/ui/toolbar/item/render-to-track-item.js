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
goog.provide('audioCat.ui.toolbar.item.RenderToTrackItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.state.command.RenderAudioToNewTrackCommand');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('goog.events');


/**
 * A toolbar item for rendering the audio of the project into a track.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions that
 *     can be performed.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.RenderToTrackItem = function(
    domHelper,
    editModeManager,
    actionManager,
    audioRenderer,
    toolTip) {
  goog.base(this, domHelper, editModeManager, actionManager, toolTip,
      'Render project to new track.', undefined, undefined,
      'Render the collective audio of this project from start to end into ' +
      'a new track.');

  /**
   * @private {!audioCat.audio.render.AudioRenderer}
   */
  this.audioRenderer_ = audioRenderer;

  // Initialize to either enabled or disabled based on rendering state.
  this.setEnabledState_(true);
};
goog.inherits(
    audioCat.ui.toolbar.item.RenderToTrackItem, audioCat.ui.toolbar.item.Item);

/**
 * Determines what happens when the user lifts up from this item.
 * @private
 */
audioCat.ui.toolbar.item.RenderToTrackItem.prototype.handleUpPress_ =
    function() {
  // Do not enable rendering into a track again until this is done.
  this.setEnabledState_(false);

  var audioRenderer = this.audioRenderer_;
  var renderOperationId = audioRenderer.getNextRenderId();
  var listenerKey = goog.events.listen(audioRenderer,
      audioCat.audio.render.EventType.AUDIO_RENDERED,
      function(event) {
        if (renderOperationId ==
          /** @type {!audioCat.audio.render.AudioRenderedEvent} */ (
              event).getRenderId()) {
          goog.events.unlistenByKey(listenerKey);
          // This render operation is relevant.
          this.setEnabledState_(true);
        }
      }, false, this);

  try {
    /** @type {!audioCat.action.render.RenderToTrackAction} */ (
        this.actionManager.retrieveAction(
            audioCat.action.ActionType.RENDER_TO_TRACK)).doAction();
  } catch (err) {
    goog.events.unlistenByKey(listenerKey);

    // This rendering failed, but allow future renderings obviously.
    this.setEnabledState_(true);
  }
};

/**
 * Determines whether the item should be enabled, and sets it so.
 * @param {boolean} enabledState Whether this item is enabled.
 * @private
 */
audioCat.ui.toolbar.item.RenderToTrackItem.prototype.setEnabledState_ =
    function(enabledState) {
  if (enabledState) {
    this.domHelper.listenForUpPress(
        this.getDom(), this.handleUpPress_, false, this);
  } else {
    this.domHelper.unlistenForUpPress(
        this.getDom(), this.handleUpPress_, false, this);
  }
  this.setVisualizeEnabledState(enabledState);
};

/** @override */
audioCat.ui.toolbar.item.RenderToTrackItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/renderToTrack.svg');
};
