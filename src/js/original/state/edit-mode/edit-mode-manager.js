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
goog.provide('audioCat.state.editMode.EditModeManager');


goog.require('audioCat.state.editMode.EditModeChangedEvent');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.asserts');


/**
 * Manages the current mode of the application.
 * @param {!Array.<!audioCat.state.editMode.EditMode>} editModes A list of edit
 *     modes that are to be supported.
 * @param {!audioCat.state.editMode.EditModeName} initialEditMode The edit mode
 *     to be in initially.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.editMode.EditModeManager = function(editModes, initialEditMode) {
  goog.base(this);

  var editModeMapping = {};
  var numberOfEditModes = editModes.length;
  for (var i = 0; i < numberOfEditModes; ++i) {
    var editMode = editModes[i];
    editModeMapping[editMode.getName()] = editMode;
  }

  /**
   * A mapping from edit mode name to the edit mode object.
   * @private {!Object.<!audioCat.state.editMode.EditModeName,
   *     !audioCat.state.editMode.EditMode>}
   */
  this.editModeMapping_ = editModeMapping;

  /**
   * The current mode.
   * @private {!audioCat.state.editMode.EditMode}
   */
  this.currentEditMode_ = editModeMapping[initialEditMode];
};
goog.inherits(
    audioCat.state.editMode.EditModeManager, audioCat.utility.EventTarget);

/**
 * Retrieves an edit mode given its name.
 * @param {audioCat.state.editMode.EditModeName} editModeName The name.
 * @return {!audioCat.state.editMode.EditMode} The edit mode with that name.
 */
audioCat.state.editMode.EditModeManager.prototype.getEditModeByName =
    function(editModeName) {
  var editMode = this.editModeMapping_[editModeName];
  goog.asserts.assert(editMode);
  return editMode;
};

/**
 * @return {!audioCat.state.editMode.EditMode} The current edit mode.
 */
audioCat.state.editMode.EditModeManager.prototype.getCurrentEditMode =
    function() {
  return this.currentEditMode_;
};

/**
 * Sets the current edit mode.
 * @param {!audioCat.state.editMode.EditModeName} editModeName The name of the
 *     edit mode to set to.
 */
audioCat.state.editMode.EditModeManager.prototype.setCurrentEditMode =
    function(editModeName) {
  var previousEditMode = this.currentEditMode_;
  var newEditMode = this.editModeMapping_[editModeName];
  this.currentEditMode_ = newEditMode;
  this.dispatchEvent(new audioCat.state.editMode.EditModeChangedEvent(
      previousEditMode, newEditMode));
};
