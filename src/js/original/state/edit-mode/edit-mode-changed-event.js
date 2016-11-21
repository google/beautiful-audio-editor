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
goog.provide('audioCat.state.editMode.EditModeChangedEvent');

goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched when the current mode changes.
 * @param {!audioCat.state.editMode.EditMode} oldMode The previous edit mode.
 * @param {!audioCat.state.editMode.EditMode} newMode The new edit mode.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.editMode.EditModeChangedEvent = function(oldMode, newMode) {
  goog.base(this, audioCat.state.editMode.Events.EDIT_MODE_CHANGED);

  /**
   * The old edit mode.
   * @private {!audioCat.state.editMode.EditMode}
   */
  this.oldMode_ = oldMode;

  /**
   * The new edit mode.
   * @private {!audioCat.state.editMode.EditMode}
   */
  this.newMode_ = newMode;
};
goog.inherits(
    audioCat.state.editMode.EditModeChangedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.editMode.EditMode} The previous edit mode.
 */
audioCat.state.editMode.EditModeChangedEvent.prototype.getPreviousEditMode =
    function() {
  return this.oldMode_;
};

/**
 * @return {!audioCat.state.editMode.EditMode} The new edit mode.
 */
audioCat.state.editMode.EditModeChangedEvent.prototype.getNewEditMode =
    function() {
  return this.newMode_;
};
