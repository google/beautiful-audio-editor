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
goog.provide('audioCat.state.DecodingEndedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event fired when decoding ends, either successfully or abortively.
 * @param {string=} errorMesssage The error that thwarted decoding. Or undefined
 *     if no errors occurred. Defaults to the empty string, indicating success.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.DecodingEndedEvent = function(errorMesssage) {
  goog.base(this, audioCat.state.events.DECODING_ENDED);

  /**
   * The error that made decoding fail if any. Or empty string if success.
   * @private {string}
   */
  this.errorMesssage_ = errorMesssage || '';
};
goog.inherits(audioCat.state.DecodingEndedEvent, audioCat.utility.Event);

/**
 * @return {string} The error that occurred while decoding. Or the empty string
 *     if no error occurred, and decoding was successful.
 */
audioCat.state.DecodingEndedEvent.prototype.getError = function() {
  return this.errorMesssage_;
};
