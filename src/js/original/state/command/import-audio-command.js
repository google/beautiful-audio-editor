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
goog.provide('audioCat.state.command.ImportAudioCommand');

goog.require('audioCat.state.command.AddTrackCommand');
goog.require('goog.asserts');



/**
 * Imports audio from a file into a new track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {string} audioName The name of the imported audio.
 * @param {!audioCat.audio.AudioChest} audioChest The chest containing the
 *     imported audio.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.ImportAudioCommand =
    function(idGenerator, audioName, audioChest) {
  audioCat.state.command.ImportAudioCommand.base(
      this, 'constructor', idGenerator, audioName, audioChest);

  /**
   * The name of the imported audio.
   * @private {string}
   */
  this.audioName_ = audioName;
};
goog.inherits(audioCat.state.command.ImportAudioCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.ImportAudioCommand.prototype.getSummary =
    function(forward) {
  return (forward ?
      'Imported ' :
      'Removed imported section ') + this.audioName_ + '.';
};

/** @override */
audioCat.state.command.ImportAudioCommand.prototype.getMemoryAdded =
    function() {
  // We just added this much memory ...
  var audioChest = this.getOptionalAudioChest();
  goog.asserts.assert(audioChest);
  return audioChest.obtainTotalByteSize();
};
