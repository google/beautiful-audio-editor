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
goog.provide('audioCat.ui.master.MasterSettingsButton');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A button for toggling whether the master settings panel appears.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.helperPanel.MasterSettingsContentProvider}
 *     masterSettingsContentProvider Provides content that allows the user to
 *     edit master settings.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.MasterSettingsButton = function(
    domHelper,
    masterSettingsContentProvider) {
  var buttonDom = new audioCat.ui.master.MainMasterButton(
      domHelper, 'Settings').getDom();
  goog.base(this, buttonDom);

  // TODO(chizeng): Remove this listener if the master settings button ever goes
  // away.
  domHelper.listenForUpPress(
      buttonDom,
      masterSettingsContentProvider.requestShow,
      false,
      masterSettingsContentProvider);
};
goog.inherits(
    audioCat.ui.master.MasterSettingsButton, audioCat.ui.widget.Widget);
