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
goog.provide('audioCat.state.effect.HighlightedStateChangedEvent');

goog.require('audioCat.state.effect.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event fired by an event when its highlighted state changes.
 * @param {boolean} newHighlightedState The new highlighted state.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.effect.HighlightedStateChangedEvent =
    function(newHighlightedState) {
  goog.base(this,
      audioCat.state.effect.EventType.EFFECT_HIGHLIGHTED_STATE_CHANTED);

  /**
   * @public {boolean}
   */
  this.newHighlightedState = newHighlightedState;
};
goog.inherits(audioCat.state.effect.HighlightedStateChangedEvent,
    audioCat.utility.Event);
