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
goog.provide('audioCat.state.command.CreateEmptyTrackCommand');

goog.require('audioCat.state.command.AddTrackCommand');


/**
 * Creates a new empty track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @constructor
 * @extends {audioCat.state.command.AddTrackCommand}
 */
audioCat.state.command.CreateEmptyTrackCommand = function(idGenerator) {
  goog.base(this, idGenerator, 'New Track', undefined);
};
goog.inherits(audioCat.state.command.CreateEmptyTrackCommand,
    audioCat.state.command.AddTrackCommand);

/** @override */
audioCat.state.command.CreateEmptyTrackCommand.prototype.getSummary =
    function(forward) {
  return (forward ? 'Added' : 'Removed') + ' new track.';
};
