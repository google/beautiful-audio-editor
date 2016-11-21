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
goog.provide('audioCat.state.editMode.SectionSplitMode');

goog.require('audioCat.state.command.SplitSectionCommand');
goog.require('audioCat.state.editMode.EditMode');
goog.require('audioCat.state.editMode.EditModeName');


/**
 * The edit mode in which the user can split sections.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager
 *     Manages and responds to resizing and scrolling.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands, thus allowing for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.editMode.EditMode}
 */
audioCat.state.editMode.SectionSplitMode = function(
    scrollResizeManager,
    commandManager,
    idGenerator) {
  goog.base(this, audioCat.state.editMode.EditModeName.SPLIT_SECTION);
  /**
   * Manages and responds to resizing and scrolling.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

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

  /**
   * A list of selected sections.
   * @private {!Array.<!audioCat.state.Section>}
   */
  this.selectedSections_ = [];
};
goog.inherits(
    audioCat.state.editMode.SectionSplitMode, audioCat.state.editMode.EditMode);

/**
 * Splits a section at a certain time into the section. Issues a command for it.
 * Only splits a section if the clip happens to be big enough.
 * @param {audioCat.state.Section} section The section to split.
 * @param {number} splitTime The time in seconds into the section to split.
 */
audioCat.state.editMode.SectionSplitMode.prototype.splitSection =
    function(section, splitTime) {
  var accumulatedClipTime = 0;
  var numberOfClips = section.getNumberOfClips();
  var clipIndex = 0;
  var clip;
  var clipDuration;
  var sampleRate = section.getSampleRate();
  // Multiply by playback rate to account for variation in speed.
  splitTime *= section.getPlaybackRate();
  while (accumulatedClipTime <= splitTime) {
    clip = section.getClipAtIndex(clipIndex);
    if (!clip) {
      // The clip could be undefined if the user keeps splitting the section
      // into tiny chunks.
      break;
    }
    clipDuration = (clip.getRightSampleBound() - clip.getBeginSampleIndex()) /
        sampleRate;
    accumulatedClipTime += clipDuration;
    ++clipIndex;
  }
  --clipIndex;

  if (clip) {
    // Sometimes, if the user eratically splits a section into very minute
    // slices, the clip could be undefined. Then, don't split it.
    var sectionBeginTime = section.getBeginTime();
    var clipSplitBeginSampleIndex = clip.getBeginSampleIndex();
    var clipSplitIntoSampleIndexDelta = Math.round(splitTime * sampleRate);
    var audioChest = section.getAudioChest();
    var sectionName = section.getName();
    var playbackRate = section.getPlaybackRate();
    var idGenerator = this.idGenerator_;
    var newSection1 = new audioCat.state.Section(
        idGenerator, audioChest, sectionName + ' 1', sectionBeginTime,
        undefined, undefined, playbackRate);
    // Add all the initial unsplit clips into the first new section.
    for (var i = 0; i < clipIndex; ++i) {
      newSection1.addClip(section.getClipAtIndex(i));
    }
    // Create a new clip.
    var splitClipSplitSampleLocation =
        clipSplitBeginSampleIndex + clipSplitIntoSampleIndexDelta;
    newSection1.addClip(new audioCat.state.Clip(
        idGenerator, clipSplitBeginSampleIndex, splitClipSplitSampleLocation));

    var newSection2 = new audioCat.state.Section(
        idGenerator, audioChest, sectionName + ' 2',
            sectionBeginTime + newSection1.getDuration(), undefined, undefined,
            playbackRate);
    newSection2.addClip(new audioCat.state.Clip(
        idGenerator, splitClipSplitSampleLocation, clip.getRightSampleBound()));
    for (var i = clipIndex + 1; i < numberOfClips; ++i) {
      newSection2.addClip(section.getClipAtIndex(i));
    }

    this.commandManager_.enqueueCommand(
        new audioCat.state.command.SplitSectionCommand(
            this.scrollResizeManager_,
            section,
            newSection1,
            newSection2,
            this.idGenerator_));
  }
};
