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
goog.provide('audioCat.state.command.AlterTrackVolumeDecibelsCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the overall volume of a track in decibels.
 * @param {!audioCat.state.Track} track The track to alter volume for.
 * @param {number} oldVolumeInDecibels The previous volume in dB.
 * @param {number} newVolumeInDecibels The new volume in dB.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterTrackVolumeDecibelsCommand =
    function(track, oldVolumeInDecibels, newVolumeInDecibels, idGenerator) {
  // TODO(chizeng): Notify user which track was updated via a track index.
  goog.base(this, idGenerator, true);

  /**
   * The track to alter volume for.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The previous volume of the track (dB).
   * @private {number}
   */
  this.oldVolumeInDecibels_ = oldVolumeInDecibels;

  /**
   * The volume to set the track to (dB).
   * @private {number}
   */
  this.newVolumeInDecibels_ = newVolumeInDecibels;
};
goog.inherits(audioCat.state.command.AlterTrackVolumeDecibelsCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setGainInDecibels(this.newVolumeInDecibels_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setGainInDecibels(this.oldVolumeInDecibels_, true);
};

/** @override */
audioCat.state.command.AlterTrackVolumeDecibelsCommand.prototype.getSummary =
    function(forward) {
  var increaseState = this.newVolumeInDecibels_ > this.oldVolumeInDecibels_;
  var description = forward ?
      (increaseState ? 'Increased' : 'Decreased') + ' volume' :
      'Undid ' + (increaseState ? 'increase' : 'decrease') + ' in volume';
  return description + ' for track ' + this.track_.getName() + '.';
};
