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
goog.provide('audioCat.state.command.RenderAudioToNewTrackCommand');

goog.require('audioCat.state.command.AddTrackCommand');
goog.require('goog.asserts');



/**
 * Renders collective current project audio into a new track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing the
 *     imported audio.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.RenderAudioToNewTrackCommand =
    function(idGenerator, audioChest) {
  goog.base(this, idGenerator, 'Rendered Audio', audioChest);
};
goog.inherits(audioCat.state.command.RenderAudioToNewTrackCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.RenderAudioToNewTrackCommand.prototype.getSummary =
    function(forward) {
  return forward ? 'Rendered audio into track.' : 'Removed rendered audio.';
};


/** @override */
audioCat.state.command.RenderAudioToNewTrackCommand.prototype.getMemoryAdded =
    function() {
  // We just added this much memory ...
  var audioChest = this.getOptionalAudioChest();
  goog.asserts.assert(audioChest);
  return audioChest.obtainTotalByteSize();
};
