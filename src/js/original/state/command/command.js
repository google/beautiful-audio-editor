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
goog.provide('audioCat.state.command.Command');

goog.require('goog.asserts');


/**
 * Performs some unit operation that alters the state of the project. An
 * abstract class.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {boolean} undoAble Whether a single operation can counter this
 *     operation during an undo. If no undoable, we have to recreate a prior
 *     state from the beginning, so it's best if commands are undoable.
 * @constructor
 */
audioCat.state.command.Command = function(idGenerator, undoAble) {
  /**
   * An ID unique to this command object instance.
   * @private {audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * Whether the command can be undone with a single operation.
   * @private {boolean}
   */
  this.undoAble_ = undoAble;
};

/**
 * @return {audioCat.utility.Id} An ID unique to this command object instance.
 */
audioCat.state.command.Command.prototype.getId = function() {
  return this.id_;
};

/**
 * Performs the changes required of the command.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 */
audioCat.state.command.Command.prototype.perform = goog.abstractMethod;

/**
 * @return {boolean} Whether the command is undoable.
 */
audioCat.state.command.Command.prototype.isUndoable = function() {
  return this.undoAble_;
};

/**
 * Undos the command. Must be implemented if this command is undoable.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 */
audioCat.state.command.Command.prototype.undo =
    function(project, trackManager) {
  goog.asserts.assert(false, 'We undid a command without undo implemented.');
};

/**
 * Retrieves a summary of the command.
 * @param {boolean} forward If true, returns a summary of the redo command,
 *     which naturally describes the forward operation. If false, returns a
 *     summary of the undo operation, which is in the backwards direction.
 * @return {string} The textual description of the specific instance of this
 *     command.
 */
audioCat.state.command.Command.prototype.getSummary = goog.abstractMethod;

/**
 * @return {number} The number of bytes added to application storage by this
 *     command. Override for other commands.
 */
audioCat.state.command.Command.prototype.getMemoryAdded = function() {
  return 0;
};
