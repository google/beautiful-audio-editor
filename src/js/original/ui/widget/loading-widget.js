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
goog.provide('audioCat.ui.widget.LoadingWidget');

goog.require('audioCat.ui.widget.Widget');


/**
 * A widget that communicates loading progress to the user.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {number=} opt_initialProgress The initial progress. Defaults to 0.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.LoadingWidget = function(domHelper, opt_initialProgress) {
  var outerContainer = domHelper.createDiv(
      goog.getCssName('loadingWidgetOuterContainer'));

  /**
   * Changes in size to reflect progress.
   * @private {!Element}
   */
  this.innerContainer_ = domHelper.createDiv(
      goog.getCssName('loadingWidgetInnerContainer'));
  domHelper.appendChild(outerContainer, this.innerContainer_);

  goog.base(this, outerContainer);

  // Set initial progress.
  this.setProgress(opt_initialProgress || 0);
};
goog.inherits(audioCat.ui.widget.LoadingWidget, audioCat.ui.widget.Widget);

/**
 * Sets the length of the inner container based on percent progress.
 * @param {number} progress A number within [0, 1] indicating progress made.
 */
audioCat.ui.widget.LoadingWidget.prototype.setProgress = function(progress) {
  this.innerContainer_.style.width = '' + Math.round(progress * 100) + '%';
};
