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
goog.provide('audioCat.action.command.RedoAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.message.MessageType');


/**
 * Performs an undo if a redo is allowed. Otherwise, does nothing. Informs the
 * user of the operation after finishing via a message.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.command.RedoAction = function(
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
};
goog.inherits(audioCat.action.command.RedoAction, audioCat.action.Action);

/** @override */
audioCat.action.command.RedoAction.prototype.doAction = function() {
  if (this.commandManager_.isRedoAllowed()) {
    this.messageManager_.issueMessage(this.commandManager_.redoCommand());
  } else {
    this.messageManager_.issueMessage(
        'No command to redo.', audioCat.ui.message.MessageType.DANGER);
  }
};
