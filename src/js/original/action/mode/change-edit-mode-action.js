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
goog.provide('audioCat.action.mode.ChangeEditModeAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('goog.asserts');


/**
 * An action for changing edit modes.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Maintains
 *     and updates the current edit mode.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.mode.ChangeEditModeAction = function(
    editModeManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;

  /**
   * The name of the edit mode we are about to switch into. Or are currently in.
   * @private {!audioCat.state.editMode.EditModeName}
   */
  this.nextEditModeName_ = editModeManager.getCurrentEditMode().getName();

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(
    audioCat.action.mode.ChangeEditModeAction, audioCat.action.Action);

/**
 * Sets the edit mode to switch into next via this action.
 * @param {!audioCat.state.editMode.EditModeName} editModeName The name of the
 *     edit mode to switch into.
 */
audioCat.action.mode.ChangeEditModeAction.prototype.setNextEditModeName =
    function(editModeName) {
  this.nextEditModeName_ = editModeName;
};

/** @override */
audioCat.action.mode.ChangeEditModeAction.prototype.doAction = function() {
  var editModeManager = this.editModeManager_;

  // Check if we should even switch modes.
  var nextEditMode = this.nextEditModeName_;
  if (editModeManager.getCurrentEditMode().getName() != nextEditMode) {
    // Actually update the edit mode.
    editModeManager.setCurrentEditMode(nextEditMode);

    // Issue a message based on the new edit mode.
    var message = 'Now, ';
    var secondPartOfMessage;
    var editModeNameEnum = audioCat.state.editMode.EditModeName;
    switch (nextEditMode) {
      case editModeNameEnum.DUPLICATE_SECTION:
        secondPartOfMessage = 'click a section to duplicate.';
        break;
      case editModeNameEnum.REMOVE_SECTION:
        secondPartOfMessage = 'click a section to delete.';
        break;
      case editModeNameEnum.SELECT:
        secondPartOfMessage = 'drag a section to move.';
        break;
      case editModeNameEnum.SPLIT_SECTION:
        secondPartOfMessage = 'press and release to split a section.';
        break;
    }
    goog.asserts.assertString(secondPartOfMessage);
    message += secondPartOfMessage;
    this.messageManager_.issueMessage(message);
  }
};
