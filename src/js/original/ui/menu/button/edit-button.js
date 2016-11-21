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
goog.provide('audioCat.ui.menu.button.EditButton');

goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('audioCat.ui.menu.item.RedoItem');
goog.require('audioCat.ui.menu.item.UndoItem');


/**
 * Top-level edit button on the menu bar.
 * @param {!audioCat.state.Project} project The project.
 * @param {!audioCat.state.TrackManager} trackManager
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Interacts
 *     with the audio context.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.EditButton = function(
    project,
    trackManager,
    domHelper,
    commandManager,
    audioContextManager) {
  /**
   * The project.
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * Manages tracks.
   * @private {!audioCat.state.TrackManager}
   */
  this.trackManager_ = trackManager;

  var menu = new audioCat.ui.menu.Menu();
  menu.addMenuItem(
      new audioCat.ui.menu.item.UndoItem(domHelper, commandManager));
  menu.addMenuItem(
      new audioCat.ui.menu.item.RedoItem(domHelper, commandManager));

  goog.base(this, 'Edit', menu);
};
goog.inherits(
    audioCat.ui.menu.button.EditButton, audioCat.ui.menu.button.MenuButton);
