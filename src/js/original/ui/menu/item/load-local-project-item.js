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
goog.provide('audioCat.ui.menu.item.LoadLocalProjectItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for loading a project from a local file.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.LoadLocalProjectItem =
    function(domHelper, actionManager, statePlanManager) {
  goog.base(this, 'Load project from local .audioproject file.');

  // Respond to clicks.
  var action = actionManager.retrieveAction(
      audioCat.action.ActionType.LOAD_PROJECT_STATE);
  this.listen(goog.ui.Component.EventType.ACTION,
      action.doAction, false, action);
};
goog.inherits(
    audioCat.ui.menu.item.LoadLocalProjectItem, audioCat.ui.menu.item.MenuItem);
