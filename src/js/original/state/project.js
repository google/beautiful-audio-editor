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
goog.provide('audioCat.state.Project');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.ProjectTitleChangedEvent');
goog.require('audioCat.utility.EventTarget');


/**
 * Maintains the updated state of a project.
 * @param {string=} opt_title The title of the project.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.Project = function(opt_title) {
  goog.base(this);
  /**
   * The title of the project.
   * @private {string}
   */
  this.title_ = opt_title || this.getDefaultProjectTitle();

  // TODO(chizeng): Pipe this value in.
  /**
   * The number of channels for the final audio output.
   * @private {number}
   */
  this.numberOfChannels_ = audioCat.audio.Constant.DEFAULT_OUTPUT_CHANNEL_COUNT;

  /**
   * The sample rate used for exporting.
   * @private {number}
   */
  this.sampleRate_ = audioCat.audio.Constant.DEFAULT_SAMPLE_RATE;
};
goog.inherits(audioCat.state.Project, audioCat.utility.EventTarget);

/**
 * @return {string} The default project title when none is provided.
 */
audioCat.state.Project.prototype.getDefaultProjectTitle = function() {
  return 'New project. TODO: Make a beautiful sound.';
};

/**
 * @return {string} The title of the project.
 */
audioCat.state.Project.prototype.getTitle = function() {
  return this.title_;
};

/**
 * Sets the title of the project.
 * @param {string} title The new title.
 * @param {boolean=} opt_stable Whether the change is stable and thus marks a
 *     long-term, not transient, change in the project title.
 */
audioCat.state.Project.prototype.setTitle = function(title, opt_stable) {
  this.title_ = title;
  this.dispatchEvent(new audioCat.state.ProjectTitleChangedEvent(opt_stable));
};

/**
 * @return {number} The sample rate used for exporting.
 */
audioCat.state.Project.prototype.getSampleRate = function() {
  return this.sampleRate_;
};

/**
 * Sets the sample rate used for exporting.
 * @param {number} sampleRate The sample rate used for exporting.
 */
audioCat.state.Project.prototype.setSampleRate = function(sampleRate) {
  this.sampleRate_ = sampleRate;
};

/**
 * Reverts the project to its original state. Used during undo. When we try to
 * undo certain pesky operations, we may just recreate a state from the
 * beginning.
 */
audioCat.state.Project.prototype.revertToOpeningState = function() {
  // TODO(chizeng): Store and revert to the original project state.
};

/**
 * Sets the number of export channels.
 * @param {number} numberOfChannels The number of export channels.
 */
audioCat.state.Project.prototype.setNumberOfChannels =
    function(numberOfChannels) {
  this.numberOfChannels_ = numberOfChannels;
};

/**
 * @return {number} The number of output channels for this project.
 */
audioCat.state.Project.prototype.getNumberOfChannels = function() {
  return this.numberOfChannels_;
};
