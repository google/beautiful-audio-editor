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
goog.provide('audioCat.state.command.ChangeProjectTitleCommand');

goog.require('audioCat.state.command.Command');


/**
 * Changes the title of the project.
 * @param {string} previousTitle The previous title.
 * @param {string} newTitle The new title.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeProjectTitleCommand =
    function(previousTitle, newTitle, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The previous title.
   * @private {string}
   */
  this.previousTitle_ = previousTitle;

  /**
   * The new title.
   * @private {string}
   */
  this.newTitle_ = newTitle;
};
goog.inherits(audioCat.state.command.ChangeProjectTitleCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeProjectTitleCommand.prototype.perform =
    function(project, trackManager) {
  project.setTitle(this.newTitle_, true);
};

/** @override */
audioCat.state.command.ChangeProjectTitleCommand.prototype.undo =
    function(project, trackManager) {
  project.setTitle(this.previousTitle_, true);
};

/** @override */
audioCat.state.command.ChangeProjectTitleCommand.prototype.getSummary =
    function(forward) {
  return forward ? 'Titled the project \'' + this.newTitle_ + '\'.' :
      'Set the project\'s title back to \'' + this.previousTitle_ + '\'.';
};
