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
goog.provide('audioCat.state.EncodingDoneEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event fired when encoding the state of the project is done.
 * @param {!Blob} encoding The encoding of the project.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.EncodingDoneEvent = function(encoding) {
  goog.base(this, audioCat.state.events.ENCODING_DONE);
  /**
   * @private {!Blob}
   */
  this.encoding_ = encoding;
};
goog.inherits(audioCat.state.EncodingDoneEvent, audioCat.utility.Event);

/**
 * @return {!Blob} The encoded state of the project.
 */
audioCat.state.EncodingDoneEvent.prototype.getEncoding = function() {
  return this.encoding_;
};
