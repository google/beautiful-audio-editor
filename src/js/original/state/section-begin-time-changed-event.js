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
goog.provide('audioCat.state.SectionBeginTimeChangedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * The event thrown by a section when its begin time changes.
 * @param {number} previousBeginTime The previous begin time in seconds.
 * @param {number} newBeginTime The new begin time in seconds.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.SectionBeginTimeChangedEvent = function(
    previousBeginTime,
    newBeginTime) {
  goog.base(this, audioCat.state.events.SECTION_BEGIN_TIME_CHANGED);

  /**
   * @private {number}
   */
  this.previousBeginTime_ = previousBeginTime;

  /**
   * @private {number}
   */
  this.newBeginTime_ = newBeginTime;
};
goog.inherits(
    audioCat.state.SectionBeginTimeChangedEvent, audioCat.utility.Event);

/**
 * @return {number} The previous begin time in seconds.
 */
audioCat.state.SectionBeginTimeChangedEvent.prototype.getPreviousBeginTime =
    function() {
  return this.previousBeginTime_;
};

/**
 * @return {number} The new begin time in seconds.
 */
audioCat.state.SectionBeginTimeChangedEvent.prototype.getNewBeginTime =
    function() {
  return this.newBeginTime_;
};
