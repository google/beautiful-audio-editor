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
goog.provide('audioCat.state.editMode.SelectEditMode');

goog.require('audioCat.state.command.MoveSectionsCommand');
goog.require('audioCat.state.editMode.EditMode');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.state.editMode.SelectionChangedEvent');


/**
 * The edit mode in which the user can select and move sections around.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history, allowing for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.editMode.EditMode}
 */
audioCat.state.editMode.SelectEditMode = function(
    commandManager,
    idGenerator) {
  goog.base(this, audioCat.state.editMode.EditModeName.SELECT);

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * A list of selected sections.
   * @private {!Array.<!audioCat.state.editMode.MoveSectionEntry>}
   */
  this.selectedSectionEntries_ = [];

  /**
   * Whether sections are snapped to the grid upon being moved. The grid could
   * either be using beats or time units.
   * @private
   */
  this.snapToGridState_ = false;

  /**
   * Manages command history, allowing for undo/redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;
};
goog.inherits(
    audioCat.state.editMode.SelectEditMode, audioCat.state.editMode.EditMode);

/**
 * Sets whether we snap to grid upon moving sections.
 * @param {boolean} snapToGridState Iff true, we snap to grid upon moving
 *     sections.
 */
audioCat.state.editMode.SelectEditMode.prototype.setSnapToGridState =
    function(snapToGridState) {
  this.snapToGridState_ = snapToGridState;
};

/**
 * @return {boolean} Whether we snap to grid upon moving sections.
 */
audioCat.state.editMode.SelectEditMode.prototype.getSnapToGridState =
    function() {
  return this.snapToGridState_;
};

/**
 * @return {!Array.<!audioCat.state.editMode.MoveSectionEntry>} A list of
 *     entries for selected sections.
 */
audioCat.state.editMode.SelectEditMode.prototype.getSelectedSectionEntries =
    function() {
  return this.selectedSectionEntries_;
};

/**
 * Sets the list of currently selected sections. Overrides the previous list.
 * @param {!Array.<!audioCat.state.editMode.MoveSectionEntry>} selected The new
 *     list of entries of selected sections.
 */
audioCat.state.editMode.SelectEditMode.prototype.setSelectedSections =
    function(selected) {
  this.selectedSectionEntries_ = selected;
  var numberOfSelected = selected.length;
  this.dispatchEvent(
      new audioCat.state.editMode.SelectionChangedEvent(selected));
};

/**
 * Selects a section of audio.
 * @param {!audioCat.state.editMode.MoveSectionEntry} entry The entry detailing
 *     the section to be selected.
 */
audioCat.state.editMode.SelectEditMode.prototype.selectSection =
    function(entry) {
  var selectedSections = this.selectedSectionEntries_;
  selectedSections.push(entry);
  this.dispatchEvent(
      new audioCat.state.editMode.SelectionChangedEvent(selectedSections));
};

/**
 * Notifies other entities that a press down has been instigated on a
 * visualization of an audio section.
 */
audioCat.state.editMode.SelectEditMode.prototype.pressDownInstigated =
    function() {
  this.dispatchEvent(
      audioCat.state.editMode.Events.SECTION_PRESS_DOWN_INSTIGATED);
};

/**
 * Confirms that sections of audio have been moved around with a command,
 * allowing for undo/redo.
 */
audioCat.state.editMode.SelectEditMode.prototype.confirmSectionMovement =
    function() {
  var sectionEntries = this.selectedSectionEntries_;
  var numberOfSectionEntries = sectionEntries.length;
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.MoveSectionsCommand(
          sectionEntries,
          this.idGenerator_),
      true);
};
