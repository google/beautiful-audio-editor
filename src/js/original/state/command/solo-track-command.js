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
goog.provide('audioCat.state.command.ChangeSoloTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Either solos or un-solos a track.
 * @param {!audioCat.state.Track} track The track to mute or unmute.
 * @param {boolean} soloState If true, the track is solo-ed. Otherwise, it is
 *     un-soloed.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeSoloTrackCommand = function(
    track,
    soloState,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track which had its mute state changed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The solo state into which the track entered.
   * @private {boolean}
   */
  this.soloState_ = soloState;
};
goog.inherits(audioCat.state.command.ChangeSoloTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setSoloedState(this.soloState_);
};

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setSoloedState(!(this.soloState_));
};

/** @override */
audioCat.state.command.ChangeSoloTrackCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'S' : 'Un-s') + 'oloed track ' +
      this.track_.getName() + '.';
};
