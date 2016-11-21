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
goog.provide('audioCat.state.command.SplitSectionCommand');

goog.require('audioCat.state.command.Command');

/**
 * Command for spliting a section into 2.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager
 *     Manages and responds to resizing and scrolling.
 * @param {!audioCat.state.Section} section The original section to split.
 * @param {!audioCat.state.Section} newSection1 The 1st new section.
 * @param {!audioCat.state.Section} newSection2 The 2nd new section.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.SplitSectionCommand = function(
    scrollResizeManager,
    section,
    newSection1,
    newSection2,
    idGenerator) {
  goog.base(this, idGenerator, true);
  /**
   * Manages and responds to resizing and scrolling.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * The track of the split section. Or null if the section did not belong to
   * a track, in which case nothing happens.
   * @private {audioCat.state.Track}
   */
  this.track_ = section.getTrack();

  /**
   * The original section to split.
   * @private {!audioCat.state.Section}
   */
  this.originalSection_ = section;

  /**
   * The first new section.
   * @private {!audioCat.state.Section}
   */
  this.newSection1_ = newSection1;

  /**
   * The second new section.
   * @private {!audioCat.state.Section}
   */
  this.newSection2_ = newSection2;
};
goog.inherits(
    audioCat.state.command.SplitSectionCommand, audioCat.state.command.Command);

/** @override */
audioCat.state.command.SplitSectionCommand.prototype.perform =
    function(project, trackManager) {
  var track = this.track_;
  if (!track) {
    // This section lacked a track, so nothing happened.
    return;
  }

  // Block scroll computations since this is not a good time for computing it.
  this.scrollResizeManager_.setIsGoodTimeForScrollCompute(false);

  // The add sections should not be silent and should for sure dispatch an
  // event.
  // However, they are transitory, which means they are part of a larger series
  // of actions that do not need to manifest to the user as a whole until all
  // actions in the series complete.
  track.removeSection(this.originalSection_, false, true);
  track.addSection(this.newSection1_, false, true);
  track.addSection(this.newSection2_);

  // Allow for scroll computations again.
  this.scrollResizeManager_.setIsGoodTimeForScrollCompute(true);
};

/** @override */
audioCat.state.command.SplitSectionCommand.prototype.undo =
    function(project, trackManager) {
  var track = this.track_;
  if (!track) {
    // This section lacked a track, so nothing happened.
    return;
  }

  // Block scroll computations since this is not a good time for computing it.
  this.scrollResizeManager_.setIsGoodTimeForScrollCompute(false);

  // See above function for reasoning of booleans.
  track.addSection(this.originalSection_, false, true);
  track.removeSection(this.newSection1_, false, true);
  track.removeSection(this.newSection2_);

  // Allow for scroll computations again.
  this.scrollResizeManager_.setIsGoodTimeForScrollCompute(true);
};

/** @override */
audioCat.state.command.SplitSectionCommand.prototype.getSummary = function(
    forward) {
  return forward ? 'Split section in half.' : 'Combined section back together.';
};
