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
goog.provide('audioCat.action.command.UndoRedoAction');

goog.require('audioCat.action.Action');


/**
 * Performs either an undo or a redo. May instigate an exception if the current
 * state does not allow for undo or redo. After performing the redo or undo,
 * displays a message to the user communicating what just happened.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.command.UndoRedoAction = function(
    commandManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * If true, calling doAction on this action will perform a redo. Otherwise,
   * calling doAction will perform an undo.
   * @private {boolean}
   */
  this.forwardDirection_ = false;
};
goog.inherits(audioCat.action.command.UndoRedoAction, audioCat.action.Action);

/**
 * Sets whether the next doAction should perform a redo or an undo. If true,
 * performs a redo. If false, performs an undo. Initially false.
 * @param {boolean} forwardDirection Whether we should perform a command in the
 *     forward direction (ie, redo).
 */
audioCat.action.command.UndoRedoAction.prototype.setForwardDirectionState =
    function(forwardDirection) {
  this.forwardDirection_ = forwardDirection;
};

/** @override */
audioCat.action.command.UndoRedoAction.prototype.doAction = function() {
  this.messageManager_.issueMessage(this.forwardDirection_ ?
      this.commandManager_.redoCommand() :
      this.commandManager_.dequeueCommand());
};
