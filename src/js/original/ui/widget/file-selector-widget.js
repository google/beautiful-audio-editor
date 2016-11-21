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
goog.provide('audioCat.ui.widget.FileSelectorWidget');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A widget used to select files.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.FileSelectorWidget = function(domHelper) {
  var container =
      domHelper.createDiv(goog.getCssName('fileSelectorWidgetContainer'));
  goog.base(this, container);

  var inputElement = domHelper.createElement('input');
  inputElement.setAttribute('type', 'file');

  /**
   * The file input element.
   * @private {!Element}
   */
  this.inputElement_ = inputElement;

  goog.events.listen(
      inputElement, 'change', this.handleFileChange_, false, this);
  domHelper.appendChild(container, inputElement);
};
goog.inherits(audioCat.ui.widget.FileSelectorWidget, audioCat.ui.widget.Widget);

/**
 * Handles changes in files.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.FileSelectorWidget.prototype.handleFileChange_ =
    function(event) {
  // TODO(chizeng): Fire an event indicating a change in files.
  return;
};

/**
 * @return {!FileList} A list of currently selected files. May be an empty file
 *     list.
 */
audioCat.ui.widget.FileSelectorWidget.prototype.getCurrentFiles = function() {
  return this.inputElement_.files;
};

/** @override */
audioCat.ui.widget.FileSelectorWidget.prototype.cleanUp = function() {
  goog.events.unlisten(
      this.inputElement_, 'change', this.handleFileChange_, false, this);

  // Call the cleanup method of the base class if it has one.
  audioCat.ui.widget.FileSelectorWidget.base(this, 'cleanUp');
};
