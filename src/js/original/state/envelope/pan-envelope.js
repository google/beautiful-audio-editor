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
goog.provide('audioCat.state.envelope.PanEnvelope');

goog.require('audioCat.state.envelope.Envelope');


/**
 * The internal model representation of an envelope for controlling panning.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!Array.<!audioCat.state.envelope.ControlPoint>=} opt_controlPoints A
 *     list of initial control points for the envelope. Empty if not provided.
 * @constructor
 * @extends {audioCat.state.envelope.Envelope}
 */
audioCat.state.envelope.PanEnvelope =
    function(idGenerator, opt_controlPoints) {
  // Initial value of 0 for volume. Volume must be within [-45, 45].
  var halfSpan = 45;
  goog.base(
      this,
      idGenerator,
      'Pan',
      0,
      -1 * halfSpan,
      halfSpan,
      '',
      opt_controlPoints);
};
goog.inherits(audioCat.state.envelope.PanEnvelope,
    audioCat.state.envelope.Envelope);
