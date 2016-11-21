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
goog.provide('audioCat.state.command.AlterSectionSpeedCommand');

goog.require('audioCat.state.command.Command');

/**
 * Command for altering the playback rate (speed) of a section while changing
 * the pitch at the same time.
 * @param {!audioCat.state.Section} section The original section to split.
 * @param {number} originalPlaybackRate The original playback rate.
 * @param {number} newPlaybackRate The new playback rate.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterSectionSpeedCommand = function(
    section, originalPlaybackRate, newPlaybackRate, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The section to change the playback rate of.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * @private {number}
   */
  this.originalPlaybackRate_ = originalPlaybackRate;

  /**
   * @private {number}
   */
  this.newPlaybackRate_ = newPlaybackRate;
};
goog.inherits(audioCat.state.command.AlterSectionSpeedCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterSectionSpeedCommand.prototype.perform =
    function(project, trackManager) {
  this.section_.setPlaybackRate(this.newPlaybackRate_);
};

/** @override */
audioCat.state.command.AlterSectionSpeedCommand.prototype.undo =
    function(project, trackManager) {
  this.section_.setPlaybackRate(this.originalPlaybackRate_);
};

/** @override */
audioCat.state.command.AlterSectionSpeedCommand.prototype.getSummary = function(
    forward) {
  return 'Set section\'s playback rate ' + (forward ? '' : 'back ') + 'to ' +
      (forward ?
          this.newPlaybackRate_ : this.originalPlaybackRate_).toFixed(2) + '.';
};
