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
goog.provide('audioCat.state.command.AlterTrackPanCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the overall pan of a track.
 * @param {!audioCat.state.Track} track The track to alter volume for.
 * @param {number} oldPan A value from 0 to 1 denoting the old volume before
 *     this command was made.
 * @param {number} newPan A value from 0 to 1 denoting the volume to set the
 *     track to.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.AlterTrackPanCommand =
    function(track, oldPan, newPan, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track to alter pan for.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The old pan of the track.
   * @private {number}
   */
  this.oldPan_ = oldPan;

  /**
   * The pan to set the track to.
   * @private {number}
   */
  this.newPan_ = newPan;
};
goog.inherits(audioCat.state.command.AlterTrackPanCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.AlterTrackPanCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setPanFromLeft(this.newPan_, true);
};

/** @override */
audioCat.state.command.AlterTrackPanCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setPanFromLeft(this.oldPan_, true);
};

/** @override */
audioCat.state.command.AlterTrackPanCommand.prototype.getSummary =
    function(forward) {
  // TODO(chizeng): Notify user which track was updated via a track index.
  var description = forward ? 'Set pan to ' + this.newPan_ :
    'Set pan back to ' + this.oldPan_;
  return description + ' for track ' + this.track_.getName() + '.';
};
