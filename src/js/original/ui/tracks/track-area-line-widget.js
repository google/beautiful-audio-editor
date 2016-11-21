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
goog.provide('audioCat.ui.tracks.TrackAreaLineWidget');

goog.require('audioCat.audio.EventType');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Draws lines in the track area.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the display of audio across the time
 *     domain.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools 2D
 *     contexts so that we do not create too many.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager
 *     Manages resizing and scrolling of the window.
 * @constructor
 */
audioCat.ui.tracks.TrackAreaLineWidget = function(
    domHelper,
    timeDomainScaleManager,
    context2dPool,
    scrollResizeManager) {

  var container = domHelper.createElement('div');
  goog.dom.classes.add(
      container, goog.getCssName('trackAreaLineWidgetContainer'));
  /**
   * The container for this widget that draws lines.
   * @private {!Element}
   */
  this.container_ = container;

  /**
   * The context for which the canvas is used to draw lines.
   * @private {!CanvasRenderingContext2D}
   */
  this.context2d_ = context2dPool.retrieve2dContext();
  var canvas = this.context2d_.canvas;
  domHelper.appendChild(container, canvas);

  /**
   * Manages scrolling and resizing.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Manages the time domain scale.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  // Redraw when the time scale changes.
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.SCORE_TIME_SWAPPED,
      this.draw_, false, this);
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.ZOOM_CHANGED, this.draw_, false, this);

  // Redraw when the tempo, beats/bar, or beat unit changes.
  var signatureTempoManager = timeDomainScaleManager.getSignatureTempoManager();
  goog.events.listen(signatureTempoManager,
      audioCat.audio.EventType.TEMPO_CHANGED, this.draw_, false, this);
  goog.events.listen(signatureTempoManager,
      audioCat.audio.EventType.BEAT_UNIT_CHANGED, this.draw_, false, this);
  goog.events.listen(signatureTempoManager,
      audioCat.audio.EventType.BEATS_IN_A_BAR_CHANGED, this.draw_, false, this);

  // Redraw upon scroll or resize. Call this function now, which the second
  // argument set to true makes happen.
  scrollResizeManager.callAfterScroll(goog.bind(this.draw_, this), true);
};

/**
 * Draws the lines that denote segments of time.
 * @private
 */
audioCat.ui.tracks.TrackAreaLineWidget.prototype.draw_ = function() {
  // Set canvas width and height based on the window.
  // TODO(chizeng): Consider setting the height/width based on the parent.
  var scrollResizeManager = this.scrollResizeManager_;
  var canvasWidth = scrollResizeManager.getWindowWidth();
  var context2d = this.context2d_;
  context2d.canvas.width = canvasWidth;
  var canvasHeight = scrollResizeManager.getWindowHeight();
  context2d.canvas.height = canvasHeight;

  var timeDomainScaleManager = this.timeDomainScaleManager_;

  // Compute how many minor ticks per major tick.
  var minorSlotsPerMajorTickCount;

  // Keep this as a float to avoid rounding errors.
  var minorTickLength;

  // The position of the current tick.
  var tickPosition;

  var xScroll = scrollResizeManager.getLeftRightScroll();
  var scale = timeDomainScaleManager.getCurrentScale();
  if (timeDomainScaleManager.getDisplayAudioUsingBars()) {
    var signatureTempoManager =
        timeDomainScaleManager.getSignatureTempoManager();
    minorSlotsPerMajorTickCount = signatureTempoManager.getBeatsInABar();
    minorTickLength = scale.convertToPixels(
        60 / signatureTempoManager.getTempo());
  } else {
    minorSlotsPerMajorTickCount = scale.getMinorTicksPerMajorTick() + 1;
    minorTickLength = scale.getMajorTickWidth() / minorSlotsPerMajorTickCount;
  }

  // Compute the index of the first minor tick.
  var minorTickIndex = xScroll / minorTickLength;
  if (minorTickIndex != 0) {
    minorTickIndex = Math.ceil(minorTickIndex);
  }
  tickPosition = (minorTickIndex * minorTickLength) - xScroll;

  // Compute values used to compute major ticks.
  var majorTickDistance = minorSlotsPerMajorTickCount * minorTickLength;
  var indicesToNextMajorTick = minorSlotsPerMajorTickCount -
      (minorTickIndex % minorSlotsPerMajorTickCount);
  if (indicesToNextMajorTick == minorSlotsPerMajorTickCount) {
    // We are right after a minor tick, right behind a major tick.
    indicesToNextMajorTick = 0;
  }
  var majorTickPosition =
      tickPosition + indicesToNextMajorTick * minorTickLength;

  // Determines whether to draw all ticks.
  var allTicks = 1;

  // Draw minor ticks if they're at least this many pixels apart.
  // Or if all ticks is turned on.
  if (allTicks || minorTickLength >= 10) {
    context2d.beginPath();
    while (tickPosition < canvasWidth) {
      if (minorTickIndex % minorSlotsPerMajorTickCount) {
        // Only draw minor tick marks where no major ticks exist.
        this.drawLine_(context2d, Math.round(tickPosition), canvasHeight);
      }
      tickPosition += minorTickLength;
      minorTickIndex += 1;
    }
    context2d.lineWidth = 1;
    context2d.strokeStyle = '#505050';
    context2d.stroke();
    context2d.closePath();
  }

  // Draw major ticks if they're at least this many pixels apart.
  if (allTicks || majorTickDistance > 4) {
    context2d.beginPath();
    tickPosition = majorTickPosition;
    while (tickPosition < canvasWidth) {
      this.drawLine_(context2d, Math.round(tickPosition), canvasHeight);
      tickPosition += majorTickDistance;
    }
    context2d.lineWidth = 1;
    context2d.strokeStyle = '#000';
    context2d.stroke();
    context2d.closePath();
  }
};

/**
 * Draws a line from the top of the canvas.
 * @param {!CanvasRenderingContext2D} context2d The context to draw with.
 * @param {number} xPosition A whole number denoting the current X position in
 *     pixels.
 * @param {number} lineHeight The height of the line to draw.
 * @private
 */
audioCat.ui.tracks.TrackAreaLineWidget.prototype.drawLine_ = function(
    context2d, xPosition, lineHeight) {
  xPosition += 0.5;
  context2d.moveTo(xPosition, 0);
  context2d.lineTo(xPosition, lineHeight);
};

/**
 * @return {!Element} The DOM element for this element.
 */
audioCat.ui.tracks.TrackAreaLineWidget.prototype.getDom = function() {
  return this.container_;
};
