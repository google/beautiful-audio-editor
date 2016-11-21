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
goog.provide('audioCat.ui.toolbar.SectionToolbar');

goog.require('audioCat.ui.toolbar.Toolbar');
goog.require('audioCat.ui.toolbar.item.DuplicateSectionModeItem');
goog.require('audioCat.ui.toolbar.item.RemoveSectionItem');
goog.require('audioCat.ui.toolbar.item.SelectModeItem');
goog.require('audioCat.ui.toolbar.item.SplitSectionModeItem');


/**
 * A toolbar that lets users manipulate sections.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.Toolbar}
 */
audioCat.ui.toolbar.SectionToolbar =
    function(domHelper, editModeManager, actionManager, toolTip) {
  var toolbarItems = [
    new audioCat.ui.toolbar.item.SelectModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.DuplicateSectionModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.SplitSectionModeItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip),
    new audioCat.ui.toolbar.item.RemoveSectionItem(
        domHelper,
        editModeManager,
        actionManager,
        toolTip)
  ];

  goog.base(this, domHelper, editModeManager, toolbarItems);
};
goog.inherits(audioCat.ui.toolbar.SectionToolbar, audioCat.ui.toolbar.Toolbar);
