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
goog.provide('audioCat.state.plan.EncoderStrategy');

goog.require('audioCat.utility.EventTarget');


/**
 * A strategy for encoding the project state.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.plan.EncoderStrategy = function() {
  goog.base(this);
};
goog.inherits(
    audioCat.state.plan.EncoderStrategy, audioCat.utility.EventTarget);

/**
 * Takes an encoding and makes the current work space take on its state,
 * overriding any existing content.
 * @param {!ArrayBuffer} encoding The encoding to actuate.
 */
audioCat.state.plan.EncoderStrategy.prototype.decode = goog.abstractMethod;

/**
 * Produces an encoding of the project that can be later used to load it.
 * @return {!Blob}
 */
audioCat.state.plan.EncoderStrategy.prototype.produceEncoding =
    goog.abstractMethod;
