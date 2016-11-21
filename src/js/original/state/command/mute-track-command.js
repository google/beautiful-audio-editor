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
goog.provide('audioCat.state.command.ChangeMuteTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Either mutes or unmutes a track.
 * @param {!audioCat.state.Track} track The track to mute or unmute.
 * @param {boolean} muteState If true, the track is muted. Otherwise, it is
 *     unmuted.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeMuteTrackCommand = function(
    track,
    muteState,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track which had its mute state changed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The mute state into which the track entered. If true, the track was muted.
   * Otherwise, the track was un-muted.
   * @private {boolean}
   */
  this.muteState_ = muteState;
};
goog.inherits(audioCat.state.command.ChangeMuteTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setMutedState(this.muteState_);
};

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setMutedState(!(this.muteState_));
};

/** @override */
audioCat.state.command.ChangeMuteTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Muted' : 'Un-muted') +
      ' track ' + this.track_.getName() + '.';
};
