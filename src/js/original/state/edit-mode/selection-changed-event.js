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
goog.provide('audioCat.state.editMode.SelectionChangedEvent');

goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.utility.Event');


/**
 * Fired when the selected sections changes.
 * @param {!Array.<!audioCat.state.editMode.MoveSectionEntry>} selectedSections
 *     The list of selected sections.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.editMode.SelectionChangedEvent = function(selectedSections) {
  goog.base(this, audioCat.state.editMode.Events.SELECTION_CHANGED);

  /**
   * A list of selected sections.
   * @private {!Array.<!audioCat.state.editMode.MoveSectionEntry>}
   */
  this.selectedSections_ = selectedSections;
};
goog.inherits(
    audioCat.state.editMode.SelectionChangedEvent, audioCat.utility.Event);

/**
 * @return {!Array.<!audioCat.state.editMode.MoveSectionEntry>} The list of
 *     selected sections.
 */
audioCat.state.editMode.SelectionChangedEvent.prototype.getSelectedSections =
    function() {
  return this.selectedSections_;
};
