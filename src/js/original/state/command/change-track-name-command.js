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
goog.provide('audioCat.state.command.ChangeTrackNameCommand');

goog.require('audioCat.state.command.Command');


/**
 * Changes the name of a track.
 * @param {!audioCat.state.Track} track The track to change the name of.
 * @param {string} previousName The previous name of the track.
 * @param {string} newName The new name of the track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.ChangeTrackNameCommand =
    function(track, previousName, newName, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track which had its name changed.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The previous name of the track.
   * @private {string}
   */
  this.previousName_ = previousName;

  /**
   * The new name of the track.
   * @private {string}
   */
  this.newName_ = newName;
};
goog.inherits(audioCat.state.command.ChangeTrackNameCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.ChangeTrackNameCommand.prototype.perform =
    function(project, trackManager) {
  this.track_.setName(this.newName_);
};

/** @override */
audioCat.state.command.ChangeTrackNameCommand.prototype.undo =
    function(project, trackManager) {
  this.track_.setName(this.previousName_);
};

/** @override */
audioCat.state.command.ChangeTrackNameCommand.prototype.getSummary =
    function(forward) {
  return 'Set track name ' + (forward ?
      'to ' + this.newName_ : 'back to ' + this.previousName_) + '.';
};
