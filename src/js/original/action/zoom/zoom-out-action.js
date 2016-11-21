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
goog.provide('audioCat.action.zoom.ZoomOutAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.message.MessageType');


/**
 * Zooms out if we can. Otherwise, issues, a warning message.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the zoom level representation.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.zoom.ZoomOutAction = function(
    timeDomainScaleManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(audioCat.action.zoom.ZoomOutAction, audioCat.action.Action);

/** @override */
audioCat.action.zoom.ZoomOutAction.prototype.doAction = function() {
  if (this.timeDomainScaleManager_.getLowestScale() ==
      this.timeDomainScaleManager_.getZoomLevel()) {
    // We can zoom in no more.
    this.messageManager_.issueMessage(
        'Farthest zoom level of ' +
            this.timeDomainScaleManager_.getLowestScale() +
                ' reached.',
        audioCat.ui.message.MessageType.DANGER);
  } else {
    // We can still zoom in, so do so.
    this.timeDomainScaleManager_.zoomOut();
    this.messageManager_.issueMessage('Zoomed out to level ' +
        this.timeDomainScaleManager_.getZoomLevel() + '.');
  }
};
