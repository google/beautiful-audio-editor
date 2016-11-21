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
goog.provide('audioCat.ui.toolbar.item.SplitSectionModeItem');

goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');


/**
 * A toolbar item for entering a mode in which users can split sections of
 *     audio.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.SplitSectionModeItem = function(
    domHelper,
    editModeManager,
    actionManager,
    toolTip) {
  var label = 'Enter split section mode.';
  var description = label +
      ' In this mode, split a section of audio in two by clicking on it and ' +
      'releasing where you would like to split it.';
  goog.base(this, domHelper, editModeManager, actionManager, toolTip, label,
      audioCat.state.editMode.EditModeName.SPLIT_SECTION, undefined,
      description);

  domHelper.listenForUpPress(
      this.getDom(), this.maybeSwitchEditMode, false, this);
};
goog.inherits(audioCat.ui.toolbar.item.SplitSectionModeItem,
    audioCat.ui.toolbar.item.Item);

/** @override */
audioCat.ui.toolbar.item.SplitSectionModeItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/splitSectionMode.svg');
};
