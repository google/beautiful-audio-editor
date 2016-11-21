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
goog.provide('audioCat.state.editMode.DuplicateSectionMode');

goog.require('audioCat.state.command.DuplicateSectionCommand');
goog.require('audioCat.state.editMode.EditMode');
goog.require('audioCat.state.editMode.EditModeName');


/**
 * The edit mode in which the user can duplicate sections of audio.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands, thus allowing for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.editMode.EditMode}
 */
audioCat.state.editMode.DuplicateSectionMode =
    function(commandManager, idGenerator) {
  goog.base(this, audioCat.state.editMode.EditModeName.DUPLICATE_SECTION);

  /**
   * Manages the history of commands.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;
};
goog.inherits(audioCat.state.editMode.DuplicateSectionMode,
    audioCat.state.editMode.EditMode);

/**
 * Duplicates a section and puts the section onto the track of the original
 * section. The new section begins right after the original section ends.
 * @param {!audioCat.state.Section} section The section to duplicate.
 */
audioCat.state.editMode.DuplicateSectionMode.prototype.duplicateSection =
    function(section) {
  var newSection = section.clone(this.idGenerator_);
  newSection.setBeginTime(section.getBeginTime() + section.getDuration());
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.DuplicateSectionCommand(
          section, newSection, this.idGenerator_));
};
