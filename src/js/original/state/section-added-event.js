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
goog.provide('audioCat.state.SectionAddedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Thrown when a section is added to a track.
 * @param {number} trackIndex The index of the track the section was added to.
 * @param {!audioCat.state.Section} section The added section of audio.
 * @param {boolean=} opt_transitory If true, indicates that this section removal
 *     is part of a larger action. For instance, perhaps we're splitting a
 *     section, in which case we remove the previous section and add two new
 *     sections. Setting this parameter to true gives respondent objects the
 *     opportunity to delay manifesting changes until the last action instead of
 *     on this action.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.SectionAddedEvent = function(
    trackIndex,
    section,
    opt_transitory) {
  goog.base(this, audioCat.state.events.SECTION_ADDED);

  /**
   * The index of the track the section was added to.
   * @private {number}
   */
  this.trackIndex_ = trackIndex;

  /**
   * The added section.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * Whether this action is transitory - part of a larger action - as documented
   * above.
   * @private {boolean}
   */
  this.transitory_ = opt_transitory || false;
};
goog.inherits(audioCat.state.SectionAddedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.Section} The section added.
 */
audioCat.state.SectionAddedEvent.prototype.getSection = function() {
  return this.section_;
};

/**
 * @return {number} The index of the track the section was added to.
 */
audioCat.state.SectionAddedEvent.prototype.getTrackIndex = function() {
  return this.trackIndex_;
};

/**
 * @return {boolean} Whether this action is transitory and thus part of a
 *     larger action as documented above.
 */
audioCat.state.SectionAddedEvent.prototype.isTransitory = function() {
  return this.transitory_;
};

