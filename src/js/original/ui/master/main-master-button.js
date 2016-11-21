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
goog.provide('audioCat.ui.master.MainMasterButton');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A generic button for some UI bar like the footer. For now, just used in the
 * footer.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {string} content The content of the string.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.MainMasterButton = function(domHelper, content) {
  var divTagName = 'div';
  var baseElement = domHelper.createElement(divTagName);
  goog.dom.classes.add(baseElement, goog.getCssName('footerMainButton'));
  goog.base(this, baseElement);

  var backgroundElement = domHelper.createElement(divTagName);
  goog.dom.classes.add(backgroundElement, goog.getCssName('backgroundElement'));
  domHelper.appendChild(baseElement, backgroundElement);

  var contentContainer = domHelper.createElement('span');
  domHelper.setTextContent(contentContainer, content);
  domHelper.appendChild(baseElement, contentContainer);
};
goog.inherits(audioCat.ui.master.MainMasterButton, audioCat.ui.widget.Widget);
