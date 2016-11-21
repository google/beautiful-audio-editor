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
goog.provide('audioCat.ui.envelope.ControlPointDownPressEvent');

goog.require('audioCat.ui.envelope.events');
goog.require('audioCat.utility.Event');


/**
 * Event fired by control point dragger upon down press.
 * @param {number} clientX The clientX value upon down press.
 * @param {number} clientY The clientY value upon down press.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.envelope.ControlPointDownPressEvent = function(clientX, clientY) {
  goog.base(this, audioCat.ui.envelope.events.CONTROL_POINT_DOWN_PRESS);

  /**
   * The clientX value upon down press.
   * @public {number}
   */
  this.clientX = clientX;

  /**
   * The clientY value upon down press.
   * @public {number}
   */
  this.clientY = clientY;
};
goog.inherits(audioCat.ui.envelope.ControlPointDownPressEvent,
    audioCat.utility.Event);
