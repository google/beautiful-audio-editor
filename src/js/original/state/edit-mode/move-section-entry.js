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
goog.provide('audioCat.state.editMode.MoveSectionEntry');


/**
 * An entry for storing section data when the section is being moved around.
 * @param {!audioCat.state.Section} section The section being moved.
 * @param {!audioCat.state.Track} track The track the section originally
 *     belonged to.
 * @param {number} beginTime The original time in seconds that the section began
 *     at in seconds.
 * @param {number} timeOffset The time offset in seconds represented by the
 *     pressdown occurring in the middle of a section visualization.
 * @param {number} beginClientX The client X value when the mouse or touch is
 *     pressed down.
 * @param {number} beginScrollX The horizontal scroll when the mouse or touch is
 *     pressed down.
 * @constructor
 */
audioCat.state.editMode.MoveSectionEntry = function(
    section,
    track,
    beginTime,
    timeOffset,
    beginClientX,
    beginScrollX) {
  /**
   * The section being moved.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * The track that the section belongs to.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The time in seconds at which the section began at before the section moved.
   * @private {number}
   */
  this.beginTime_ = beginTime;

  /**
   * The time offset in seconds represented by the pressdown being in the middle
   * of a visualization section.
   * @private {number}
   */
  this.timeOffset_ = timeOffset;

  /**
   * The client X value when the mouse / touch was first pressed down.
   * @private {number}
   */
  this.beginClientX_ = beginClientX;

  /**
   * The horizontal scroll pixel value when the mouse / touch was first pressed
   * down.
   * @private {number}
   */
  this.beginScrollX_ = beginScrollX;
};

/**
 * @return {!audioCat.state.Section} The section being moved.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getSection = function() {
  return this.section_;
};

/**
 * @return {!audioCat.state.Track} The track that the section belonged to before
 *     the section was moved.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getTrack = function() {
  return this.track_;
};

/**
 * @return {number} The time in seconds that the section originally began at.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getBeginTime = function() {
  return this.beginTime_;
};

/**
 * @return {number} The time offset in seconds represented by the pressdown
 *     being in the middle of a section.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getTimeOffset = function() {
  return this.timeOffset_;
};

/**
 * @return {number} The original client X value.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getBeginClientX =
    function() {
  return this.beginClientX_;
};

/**
 * @return {number} The original horizontal scroll value in pixels.
 */
audioCat.state.editMode.MoveSectionEntry.prototype.getBeginScrollX =
    function() {
  return this.beginScrollX_;
};
