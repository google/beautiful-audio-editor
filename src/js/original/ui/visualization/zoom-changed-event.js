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
goog.provide('audioCat.ui.visualization.ZoomChangedEvent');

goog.require('audioCat.ui.visualization.events');
goog.require('audioCat.utility.Event');


/**
 * Event dispatched when the current zoom changes.
 * @param {number} previousZoomIndex The previous zoom index.
 * @param {number} zoomIndex The updated zoom index.
 * @param {!audioCat.ui.visualization.TimeDomainScale} timeDomainScale The
 *     current scale to use for rendering audio time domain representations.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.visualization.ZoomChangedEvent =
    function(previousZoomIndex, zoomIndex, timeDomainScale) {
  goog.base(this, audioCat.ui.visualization.events.ZOOM_CHANGED);

  /**
   * The previous zoom index.
   * @private {number}
   */
  this.previousZoomIndex_ = previousZoomIndex;

  /**
   * The updated zoom index.
   * @private {number}
   */
  this.zoomIndex_ = zoomIndex;

  /**
   * The updated time domain scale to render audio with.
   * @private {!audioCat.ui.visualization.TimeDomainScale}
   */
  this.timeDomainScale_ = timeDomainScale;
};
goog.inherits(
    audioCat.ui.visualization.ZoomChangedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.ui.visualization.TimeDomainScale} The updated time domain
 *     scale to render audio with.
 */
audioCat.ui.visualization.ZoomChangedEvent.prototype.getTimeDomainScale =
    function() {
  return this.timeDomainScale_;
};
