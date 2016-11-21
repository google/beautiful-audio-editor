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
goog.provide('audioCat.state.command.RemoveTrackCommand');

goog.require('audioCat.state.command.Command');


/**
 * Removes a track.
 * @param {!audioCat.state.Track} track The track to remove.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.RemoveTrackCommand = function(
    track,
    idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * The track to remove.
   * @private {!audioCat.state.Track}
   */
  this.track_ = track;

  /**
   * The index of the removed track. If null, the index had not been computed
   * yet. This means that the command had not been performed yet.
   * @private {?number}
   */
  this.trackIndex_ = null;

  /**
   * The solo-ed state of the track upon removal. This is important to note
   * since removing a solo-ed track means that the other tracks won't play. We
   * hence unsolo the track when it's removed. And then, if the track is ever
   * added back, we solo it.
   * @private {boolean}
   */
  this.soloedStateUponRemoval_ = track.getSoloedState();
};
goog.inherits(audioCat.state.command.RemoveTrackCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.perform =
    function(project, trackManager) {
  var track = this.track_;
  if (this.soloedStateUponRemoval_) {
    // If we remove a solo-ed track, all the other tracks will be silent.
    // That's ... definitely not what we want.
    track.setSoloedState(false);
  }
  this.trackIndex_ = trackManager.removeTrackGivenObject(track);
};

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.undo =
    function(project, trackManager) {
  // The perform method of this function must have been executed before undo can
  // be executed.
  var track = this.track_;
  trackManager.addTrack(track, /** @type {number} */ (this.trackIndex_));
  track.setSoloedState(this.soloedStateUponRemoval_);
};

/** @override */
audioCat.state.command.RemoveTrackCommand.prototype.getSummary = function(
    forward) {
  return (forward ? 'Remov' : 'Un-remov') + 'ed track ' +
      this.track_.getName() + '.';
};
