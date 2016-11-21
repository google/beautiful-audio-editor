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
goog.provide('audioCat.ui.toolbar.PlayToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.PlayPauseItem');
goog.require('audioCat.ui.toolbar.item.ResetPlayTimeItem');


/**
 * A toolbar with items for playing, pausing, and reseting audio.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the time
 *     displayed.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     scrolling. As well as the UI's reactions to scrolling.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.PlayToolbar = function(
    playManager,
    timeManager,
    domHelper,
    editModeManager,
    scrollResizeManager,
    actionManager,
    toolTip) {
  goog.base(this, domHelper, editModeManager, [
        new audioCat.ui.toolbar.item.ResetPlayTimeItem(
            domHelper,
            editModeManager,
            playManager,
            timeManager,
            scrollResizeManager,
            actionManager,
            toolTip),
        new audioCat.ui.toolbar.item.PlayPauseItem(
            domHelper,
            editModeManager,
            playManager,
            actionManager,
            toolTip)
    ]);
};
goog.inherits(audioCat.ui.toolbar.PlayToolbar, audioCat.ui.toolbar.Toolbar);
