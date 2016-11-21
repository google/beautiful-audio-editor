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
goog.provide('audioCat.action.track.CreateEmptyTrackAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.command.CreateEmptyTrackCommand');


/**
 * Creates an empty track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout one instance of the application.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.track.CreateEmptyTrackAction = function(
    idGenerator,
    commandManager) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;
};
goog.inherits(audioCat.action.track.CreateEmptyTrackAction,
    audioCat.action.Action);

/** @override */
audioCat.action.track.CreateEmptyTrackAction.prototype.doAction = function() {
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.CreateEmptyTrackCommand(this.idGenerator_));
};
