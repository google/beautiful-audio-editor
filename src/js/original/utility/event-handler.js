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
goog.provide('audioCat.utility.EventHandler');

goog.require('goog.events.EventHandler');


/**
 * Coordinates event listeners so they can be later easily removed en mass.
 * @param {!Object=} opt_scope Object in whose scope to call the listeners.
 * @constructor
 * @extends {goog.events.EventHandler}
 */
audioCat.utility.EventHandler = function(opt_scope) {
  goog.base(this, opt_scope);
};
goog.inherits(audioCat.utility.EventHandler, goog.events.EventHandler);
