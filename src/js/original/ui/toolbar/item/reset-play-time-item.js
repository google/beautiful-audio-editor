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
goog.provide('audioCat.ui.toolbar.item.ResetPlayTimeItem');

goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');


/**
 * A toolbar item for pausing and setting the play time to the beginning.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the time
 *     displayed.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     scrolling. As well as the UI's reactions to scrolling.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.ResetPlayTimeItem = function(
    domHelper,
    editModeManager,
    playManager,
    timeManager,
    scrollResizeManager,
    actionManager,
    toolTip) {
  var label = 'Set play time to 0.';
  audioCat.ui.toolbar.item.ResetPlayTimeItem.base(
      this, 'constructor', domHelper, editModeManager, actionManager, toolTip,
      label, undefined, undefined, label);

  domHelper.listenForUpPress(this.getDom(), function() {
      // Pause if necessary and set the time to the beginning upon up press.
      if (playManager.getPlayState()) {
        playManager.pause();
      }
      timeManager.setStableTime(0);
      // Scroll to the beginning.
      scrollResizeManager.scrollTo(0, scrollResizeManager.getTopBottomScroll());
    });
};
goog.inherits(
    audioCat.ui.toolbar.item.ResetPlayTimeItem, audioCat.ui.toolbar.item.Item);

/** @override */
audioCat.ui.toolbar.item.ResetPlayTimeItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/goToBeginning.svg');
};
