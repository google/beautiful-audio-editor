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
goog.provide('audioCat.ui.menu.item.ImportAudioItem');

goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for importing a new track of audio.
 * @param {!audioCat.action.RequestAudioImportAction} requestImportAudioAction
 *     An action for requesting audio import.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.ImportAudioItem =
    function(requestImportAudioAction) {
  goog.base(this, 'Import local sound file.');

  /**
   * The action for requesting audio import.
   * @private {!audioCat.action.RequestAudioImportAction}
   */
  this.requestImportAudioAction_ = requestImportAudioAction;

  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(audioCat.ui.menu.item.ImportAudioItem,
    audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.ImportAudioItem.prototype.handleClick_ = function() {
  this.requestImportAudioAction_.doAction();
};
