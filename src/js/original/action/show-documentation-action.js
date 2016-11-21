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
goog.provide('audioCat.action.ShowDocumentationAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.command.CreateEmptyTrackCommand');
goog.require('goog.window');


/**
 * Creates an empty track.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.ShowDocumentationAction = function(
    domHelper) {
};
goog.inherits(audioCat.action.ShowDocumentationAction, audioCat.action.Action);

/** @override */
audioCat.action.ShowDocumentationAction.prototype.doAction = function() {
  // Opens documentation in a new tab.
  goog.window.open('/docs');
};
