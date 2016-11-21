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
goog.provide('audioCat.state.ProjectTitleChangedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event marking the change in the project title.
 * @param {boolean=} opt_stableChange Whether the change in project title is
 *     stable and thus indicates a long-term, not transient, change.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.ProjectTitleChangedEvent = function(opt_stableChange) {
  goog.base(this, audioCat.state.events.PROJECT_TITLE_CHANGED);
  /**
   * Whether the change is stable.
   * @type {boolean}
   */
  this.stable = !!opt_stableChange;
};
goog.inherits(audioCat.state.ProjectTitleChangedEvent, audioCat.utility.Event);
