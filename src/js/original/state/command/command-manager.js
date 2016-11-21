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
goog.provide('audioCat.state.command.CommandManager');

goog.require('audioCat.state.command.CommandHistoryChangedEvent');
goog.require('audioCat.state.command.Event');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Manages command history. Performs undos and redos.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager Manages the state of
 *     audio tracks.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.command.CommandManager = function(
    idGenerator,
    project,
    trackManager,
    memoryManager) {
  goog.base(this);
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The project.
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  /**
   * Manages memory.
   * @private {!audioCat.state.MemoryManager}
   */
  this.memoryManager_ = memoryManager;

  /**
   * A list of commands in the order in which they were run.
   * @private {!Array.<!audioCat.state.command.Command>}
   */
  this.commands_ = [];

  /**
   * The ID of the current series of commands. A new series could begin for
   * instance if the user loads a project.
   * @private {audioCat.utility.Id}
   */
  this.epochId_ = idGenerator.obtainUniqueId();

  /**
   * The index into the commands list that pertains to the current command - the
   * most recent command. If less than 0, no more recent command exists.
   * @private {number}
   */
  this.currentCommandIndex_ = -1;
};
goog.inherits(audioCat.state.command.CommandManager,
    audioCat.utility.EventTarget);

/**
 * @return {audioCat.utility.Id} The ID of the current epoch, which is a label
 *     for any one series of commands.
 */
audioCat.state.command.CommandManager.prototype.getCurrentEpochId = function() {
  return this.epochId_;
};

/**
 * Performs a command and enqueues the command into the command history.
 * @param {!audioCat.state.command.Command} command The command to enqueue.
 * @param {boolean=} opt_suppressPerform If provided and true, the command is
 *     not performed upon being enqueued into the command manager. This should
 *     be specified if the command is to be performed outside the command
 *     manager - for instance, when the track is changed as the user drags. If
 *     not provided or false, the command manager calls the perform method of
 *     the command.
 */
audioCat.state.command.CommandManager.prototype.enqueueCommand =
    function(command, opt_suppressPerform) {
  if (!opt_suppressPerform) {
    command.perform(this.project_, this.trackManager_);
    this.memoryManager_.addBytes(command.getMemoryAdded());
  }
  var commands = this.commands_;
  var newIndex = this.currentCommandIndex_ + 1;
  commands[newIndex] = command;
  var newLengthOfCommandsArray = newIndex + 1;
  
  // Note any memory that we just got rid of by removing references to commands.
  var memorySubtracted = 0;
  for (var c = newLengthOfCommandsArray; c < commands.length; ++c) {
    memorySubtracted += commands[c].getMemoryAdded();
  }
  if (memorySubtracted == 0) {
    // No memory subtracted, but memory needed to represent project might have
    // decreased.
    this.memoryManager_.noteMemoryNeededChange();
  } else {
    // Overall memory changed.
    this.memoryManager_.subtractBytes(memorySubtracted);
  }

  commands.length = newLengthOfCommandsArray;
  this.currentCommandIndex_ = newIndex;
  this.dispatchEvent(new audioCat.state.command.CommandHistoryChangedEvent());
};

/**
 * Undos a command and moves the current command back. Throws an exception if
 * no previous command exists.
 * @return {string} A summary of what happened during undo.
 */
audioCat.state.command.CommandManager.prototype.dequeueCommand = function() {
  var currentCommandIndex = this.getCurrentCommandIndex();

  // The current state must allow for undo.
  goog.asserts.assert(this.isUndoAllowed());

  var commands = this.commands_;
  var command = commands[currentCommandIndex];
  var project = this.project_;
  var trackManager = this.trackManager_;
  if (command.isUndoable()) {
    command.undo(project, trackManager);
  } else {
    // TODO(chizeng): Be careful about book-keeping memory here. Haven't really
    // tested out this logic much yet ...
    this.trackManager_.revertToOpeningState();
    this.project_.revertToOpeningState();
    for (var i = 0; i < currentCommandIndex; ++i) {
      commands[i].perform(project, trackManager);
    }
  }
  this.currentCommandIndex_ -= 1;
  this.dispatchEvent(new audioCat.state.command.CommandHistoryChangedEvent());

  // Memory needed could have changed from this.
  this.memoryManager_.noteMemoryNeededChange();

  // False means get the backward direction description of the command.
  return command.getSummary(false);
};

/**
 * Redoes the previously undone command. Throws an exception if no later
 * command exists.
 * @return {string} A summary of what happened during redo.
 */
audioCat.state.command.CommandManager.prototype.redoCommand = function() {
  var commands = this.commands_;

  // The current state must allow for redo.
  goog.asserts.assert(this.isRedoAllowed());

  this.currentCommandIndex_ += 1;
  var command = commands[this.currentCommandIndex_];
  command.perform(this.project_, this.trackManager_);
  this.dispatchEvent(new audioCat.state.command.CommandHistoryChangedEvent());

  // Note that memory usage could have changed.
  this.memoryManager_.noteMemoryNeededChange();

  // True means get the forward direction description of the command.
  return command.getSummary(true);
};

/**
 * @return {number} The index of the current command.
 */
audioCat.state.command.CommandManager.prototype.getCurrentCommandIndex =
    function() {
  return this.currentCommandIndex_;
};

/**
 * @return {audioCat.state.command.Command} The command that would be undo-ed
 *     next. Or null if no such command exists - for example, perhaps no
 *     commands have been performed yet.
 */
audioCat.state.command.CommandManager.prototype.getNextCommandToUndo =
    function() {
  return this.isUndoAllowed() ?
      this.commands_[this.currentCommandIndex_] : null;
};

/**
 * @return {number} The number of commands remembered.
 */
audioCat.state.command.CommandManager.prototype.getNumberOfCommands =
    function() {
  return this.commands_.length;
};

/**
 * @return {boolean} True if and only if undo is allowed.
 */
audioCat.state.command.CommandManager.prototype.isUndoAllowed =
    function() {
  // Allow undo so long as previous commands exist.
  return this.currentCommandIndex_ >= 0;
};

/**
 * @return {boolean} True if and only if redo is allowed.
 */
audioCat.state.command.CommandManager.prototype.isRedoAllowed =
    function() {
  // Allow redo so long as later elements exist.
  return this.currentCommandIndex_ < this.commands_.length - 1;
};

/**
 * Clears the entire history of commands, obliterating the current state of
 * redos and undos allowed. Call this function sparingly and carefully. Does not
 * change any memory information.
 */
audioCat.state.command.CommandManager.prototype.obliterateHistory =
    function() {
  this.commands_.length = 0;
  this.currentCommandIndex_ = -1;
  this.epochId_ = this.idGenerator_.obtainUniqueId();
  this.dispatchEvent(new audioCat.state.command.CommandHistoryChangedEvent());
};

/**
 * Performs a command without leaving a trace in the history.
 * @param {!audioCat.state.command.Command} command The command to perform.
 * @param {boolean=} opt_backward If true, performs the backwards (undo)
 *     direction. Else performs the forward command.
 */
audioCat.state.command.CommandManager.prototype.justDoCommand = function(
    command, opt_backward) {
  (opt_backward ? command.undo : command.perform).call(
      command, this.project_, this.trackManager_);
  // Note that memory usage could have changed.
  this.memoryManager_.noteMemoryNeededChange();
};
