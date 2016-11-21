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
goog.provide('audioCat.service.MainServiceChangedEvent');

goog.require('audioCat.service.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event indicating that the main service has changed. Maybe we just
 * integrated with Google Drive for instance.
 * @param {audioCat.service.Service} oldService The previous service. Or null if
 *     none.
 * @param {audioCat.service.Service} newService The new service. Or null if
 *     none.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.service.MainServiceChangedEvent = function(oldService, newService) {
  goog.base(this, audioCat.service.EventType.MAIN_SERVICE_CHANGED);
  /**
   * @type {audioCat.service.Service}
   */
  this.oldService = oldService;

  /**
   * @type {audioCat.service.Service}
   */
  this.newService = newService;
};
goog.inherits(audioCat.service.MainServiceChangedEvent, audioCat.utility.Event);
