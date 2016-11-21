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
goog.provide('audioCat.state.command.RemoveSectionFromTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Removes a section from its track.
 * @param {!audioCat.state.Track} track The track from which to remove the
 *     section.
 * @param {!audioCat.state.Section} section The section to remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveSectionFromTrackCommand = function(
    track,
    section,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track from which the section was removed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The section removed.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;
};
goog.inherits(audioCat.state.command.RemoveSectionFromTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.removeSection(this.section_);
};

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.addSection(this.section_);
};

/** @override */
audioCat.state.command.RemoveSectionFromTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Remov' : 'Add') + 'ed section ' +
      (forward ? 'from' : 'to') + ' track ' + this.track_.getName() + '.';
};
