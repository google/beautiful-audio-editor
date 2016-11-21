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
goog.provide('audioCat.ui.menu.item.RedoItem');

goog.require('audioCat.state.command.Event');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for redo-ing a command.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Executes and
 *     manages commands. Allows for undo and redo.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.RedoItem =
    function(domHelper, commandManager) {
  goog.base(this, 'Redo');

  /**
   * Manages command history.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  // Deactivate menu item if necessary.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);

  this.setEnabledState_();
  // If command history changes (ie, undos, redos performed), update enabled
  // state.
  goog.events.listen(commandManager,
      audioCat.state.command.Event.COMMAND_HISTORY_CHANGED,
          this.setEnabledState_, false, this);
};
goog.inherits(audioCat.ui.menu.item.RedoItem, audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.RedoItem.prototype.handleClick_ = function() {
  this.commandManager_.redoCommand();
};

/**
 * Enables or disables the state of the item based on whether we can undo now.
 * @private
 */
audioCat.ui.menu.item.RedoItem.prototype.setEnabledState_ = function() {
  this.setEnabled(this.commandManager_.isRedoAllowed());
};
