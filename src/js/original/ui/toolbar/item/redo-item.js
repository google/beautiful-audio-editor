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
goog.provide('audioCat.ui.toolbar.item.RedoItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.command.Event');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('goog.events');


/**
 * A toolbar item for entering a mode in which users can redo operations if
 * applicable.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history. Executes undos and redos.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.RedoItem = function(
    domHelper, commandManager, editModeManager, actionManager, toolTip) {
  goog.base(this, domHelper, editModeManager, actionManager, toolTip, '');

  /**
   * Manages command history.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  this.activateOrDeactivate_();
  goog.events.listen(commandManager,
      audioCat.state.command.Event.COMMAND_HISTORY_CHANGED,
      this.activateOrDeactivate_, false, this);
};
goog.inherits(audioCat.ui.toolbar.item.RedoItem, audioCat.ui.toolbar.item.Item);

/**
 * Activates the button.
 * @private
 */
audioCat.ui.toolbar.item.RedoItem.prototype.activate_ = function() {
  this.domHelper.listenForUpPress(
      this.getDom(), this.handleUpPress_, false, this);
  this.setVisualizeEnabledState(true);
  this.setDescription('Redo the previously undone command.');
};

/**
 * De-activates the item.
 * @private
 */
audioCat.ui.toolbar.item.RedoItem.prototype.deActivate_ = function() {
  this.domHelper.unlistenForUpPress(
      this.getDom(), this.handleUpPress_, false, this);
  this.setVisualizeEnabledState(false);
  this.setDescription('Redo is currently disabled.');
};

/**
 * Handles what happens when the command history changes.
 * @private
 */
audioCat.ui.toolbar.item.RedoItem.prototype.activateOrDeactivate_ =
    function() {
  if (this.commandManager_.isRedoAllowed()) {
    this.activate_();
  } else {
    this.deActivate_();
  }
  this.setAriaLabel(this.determineAriaLabel_());
};

/**
 * Determines the currently proper aria label.
 * @return {string} The proper aria label to apply.
 * @private
 */
audioCat.ui.toolbar.item.RedoItem.prototype.determineAriaLabel_ = function() {
  return this.commandManager_.isRedoAllowed() ?
      'Redo.' : 'Disabled redo button.';
};

/**
 * Executes a redo.
 * @private
 */
audioCat.ui.toolbar.item.RedoItem.prototype.handleUpPress_ = function() {
  var action = /** @type {!audioCat.action.command.UndoRedoAction} */ (
      this.actionManager.retrieveAction(audioCat.action.ActionType.REDO));
  action.doAction();
};

/** @override */
audioCat.ui.toolbar.item.RedoItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/redoItem.svg');
};
