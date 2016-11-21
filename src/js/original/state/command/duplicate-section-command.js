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
goog.provide('audioCat.state.command.DuplicateSectionCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command for duplicating a section. Puts the section on the same track
 * if the original section was on a track. The newly created section follows
 * right after the original section.
 * @param {!audioCat.state.Section} section The original section.
 * @param {!audioCat.state.Section} newSection The newly created section.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.DuplicateSectionCommand =
    function(section, newSection, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track of the original section. Or null if the section lacked a track.
   * @private {audioCat.state.Track}
   */
  this.track_ = section.getTrack();

  /**
   * The original section from which the new section was duplicated from.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * The newly created section.
   * @private {!audioCat.state.Section}
   */
  this.newSection_ = newSection;
};
goog.inherits(audioCat.state.command.DuplicateSectionCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.DuplicateSectionCommand.prototype.perform =
    function(project, trackManager) {
  var track = this.track_;
  if (!track) {
    // No track, so nothing to do.
    return;
  }
  track.addSection(this.newSection_);
};

/** @override */
audioCat.state.command.DuplicateSectionCommand.prototype.undo =
    function(project, trackManager) {
  var track = this.track_;
  if (!track) {
    // No track, so nothing to do.
    return;
  }
  track.removeSection(this.newSection_);
};

/** @override */
audioCat.state.command.DuplicateSectionCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Made a copy of a section in track ' +
        this.track_.getName() :
      'Removed copy of section') + '.';
};
