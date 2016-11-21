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
goog.provide('audioCat.ui.tracks.TimeDomainRuler');

goog.require('audioCat.audio.EventType');
goog.require('audioCat.ui.text.Precision');
goog.require('audioCat.ui.visualization.TimeUnit');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * The ruler that denotes the time for tracks. Scales to updates.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Maintains and updates the current time-domain
 *     scale.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools 2D
 *     contexts so that we do not create too many.
 * @param {number} rulerHeight The height of the ruler in pixels. A whole
 *     number.
 * @param {!audioCat.ui.window.ScrollResizeManager} resizeScrollManager Manages
 *     resizing and scrolling.
 * @param {!audioCat.audio.play.TimeManager} timeManager Manages the current
 *     displayed and stable play time.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @constructor
 */
audioCat.ui.tracks.TimeDomainRuler = function(
    domHelper,
    timeDomainScaleManager,
    context2dPool,
    rulerHeight,
    resizeScrollManager,
    timeManager,
    playManager,
    timeFormatter) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages resizing and scrolling.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.resizeScrollManager_ = resizeScrollManager;

  /**
   * Manages the current displayed and stable play time.
   * @private {!audioCat.audio.play.TimeManager}
   */
  this.timeManager_ = timeManager;

  /**
   * Manages the playing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  /**
   * Maintains and updates the current time-domain scale.
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;
  // Redraw when the zoom level has changed.
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.ZOOM_CHANGED, this.handleZoomChange_,
      false, this);

  // Redraw when we change whether we're displaying using bars or time units.
  goog.events.listen(timeDomainScaleManager,
      audioCat.ui.visualization.events.SCORE_TIME_SWAPPED,
      this.handleScoreTimeSwapped_, false, this);

  // Redraw when the tempo changes.
  goog.events.listen(timeDomainScaleManager.getSignatureTempoManager(),
      audioCat.audio.EventType.TEMPO_CHANGED,
      this.handleTempoChanged_, false, this);

  var context2d = context2dPool.retrieve2dContext();
  context2d.fillStyle = '#000';
  var canvas = context2d.canvas;
  canvas.height = rulerHeight;

  /**
   * The 2D context for the canvas on which to draw the ruler.
   * @private {!CanvasRenderingContext2D}
   */
  this.context2d_ = context2d;

  // When the user clicks on the ruler, set the current time.
  domHelper.listenForPress(canvas, this.handleClick_, false, this);

  /**
   * The height of the canvas for the ruler. A whole number.
   * @private {number}
   */
  this.rulerHeight_ = rulerHeight;

  /**
   * The canvas Y value of the top of a major tick. A whole number.
   * @private {number}
   */
  this.rulerMajorTickYValue_ = rulerHeight - 10;

  /**
   * The starting Y value (the top of) of the major tick.
   * @private {number}
   */
  this.majorTickTopPosition_ = this.rulerMajorTickYValue_ - 3;

  /**
   * The canvas Y value of the top of a minor tick. A whole number.
   * @private {number}
   */
  this.rulerMinorTickYValue_ = rulerHeight - 5;

  // TODO(chizeng): Consider the scroll upon load.
  this.draw(resizeScrollManager.getLeftRightScroll());
};

/**
 * Handles what happens when the user clicks on the canvas for the ruler.
 * Specifically, changes the play time.
 * @param {!goog.events.BrowserEvent} event The associated click event.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.handleClick_ = function(event) {
  var wholisticPixelValue = this.domHelper_.obtainOffsetX(event) +
      this.resizeScrollManager_.getLeftRightScroll();
  var associatedTime = this.timeDomainScaleManager_.getCurrentScale().
      convertToSeconds(wholisticPixelValue);
  var playManager = this.playManager_;
  if (playManager.getPlayState()) {
    playManager.pause();
  }
  this.timeManager_.setStableTime(associatedTime);
};

/**
 * Handles what happens when the zoom changes.
 * @param {!audioCat.ui.visualization.ZoomChangedEvent} event The associated
 *     event.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.handleZoomChange_ =
    function(event) {
  this.redrawTakeScrollIntoAccount_();
};

/**
 * Handles what happens when we swap whether to display with time units or bars.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.handleScoreTimeSwapped_ =
    function() {
  this.redrawTakeScrollIntoAccount_();
};

/**
 * Handles what happens when the tempo changes. Redraws the canvas if we are
 * displaying audio using bars instead of time units.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.handleTempoChanged_ =
    function() {
  if (this.timeDomainScaleManager_.getDisplayAudioUsingBars()) {
    this.redrawTakeScrollIntoAccount_();
  }
};

/**
 * Redraws the ruler, taking into account the scroll.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.redrawTakeScrollIntoAccount_ =
    function() {
  this.draw(this.resizeScrollManager_.getLeftRightScroll());
};

/**
 * Draws the ruler once.
 * @param {number} xScroll The number of pixels from the left the user has
 *     scrolled.
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.draw = function(xScroll) {
  var canvasWidth = this.domHelper_.getViewportSize().width;
  var context2d = this.context2d_;
  context2d.canvas.width = canvasWidth;
  context2d.clearRect(0, 0, canvasWidth, this.rulerHeight_);

  if (this.timeDomainScaleManager_.getDisplayAudioUsingBars()) {
    this.drawUsingBars_(xScroll);
  } else {
    this.drawUsingTimeUnits_(xScroll);
  }
};

/**
 * Draws the ruler once assuming that we are displaying audio using bars.
 * @param {number} xScroll The number of pixels from the left the user has
 *     scrolled.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.drawUsingBars_ =
    function(xScroll) {
  var timeDomainScaleManager = this.timeDomainScaleManager_;
  var scale = timeDomainScaleManager.getCurrentScale();
  var signatureTempoManager = timeDomainScaleManager.getSignatureTempoManager();
  var context2d = this.context2d_;

  // Figure out how many pixels per beat. Save as a float.
  var pixelsPerBeat = scale.convertToPixels(
      60 / signatureTempoManager.getTempo());

  var beatIndex = xScroll / pixelsPerBeat;
  if (xScroll % pixelsPerBeat != 0) {
    beatIndex = Math.ceil(beatIndex);
  }

  // Find out the location of the first tick.
  var tickPosition = beatIndex * pixelsPerBeat - xScroll;

  // Draw the tick for the beat. Label it.
  context2d.beginPath();
  context2d.textAlign = 'center';
  var canvasWidth = context2d.canvas.width;

  var beatsPerMeasure = signatureTempoManager.getBeatsInABar();

  // Make sure that major ticks never get closer than this many pixels.
  var minDistanceBetweenMajorTicks = 40;
  var skipCycle = beatsPerMeasure * Math.ceil(
      minDistanceBetweenMajorTicks / (pixelsPerBeat * beatsPerMeasure));

  while (tickPosition < canvasWidth) {
    if (beatIndex % skipCycle) {
      // We have a minor tick.
      this.drawMinorTick_(context2d, Math.round(tickPosition));
    } else {
      // Draw a major tick
      this.drawMajorTick_(
          context2d, Math.round(tickPosition), String(beatIndex));
    }

    ++beatIndex;
    tickPosition += pixelsPerBeat;
  }

  context2d.closePath();
  context2d.strokeStyle = '#000';
  context2d.lineWidth = 1;
  context2d.stroke();
};

/**
 * Draws the ruler once assuming that we are displaying audio using time units.
 * @param {number} xScroll The number of pixels from the left the user has
 *     scrolled.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.drawUsingTimeUnits_ =
    function(xScroll) {
  var domHelper = this.domHelper_;
  var context2d = this.context2d_;
  var scale = this.timeDomainScaleManager_.getCurrentScale();

  // The viewport size is an over-estimate of how long the ruler must be.
  var viewportSize = domHelper.getViewportSize();
  var canvasWidth = viewportSize.width;
  context2d.canvas.width = canvasWidth;
  var rulerHeight = this.rulerHeight_;
  context2d.clearRect(0, 0, canvasWidth, rulerHeight);

  context2d.beginPath();

  var majorTickPixelDistance = scale.getMajorTickWidth();
  var majorTickTimeDelta = scale.getSecondsFromTimeUnits(
      scale.getMajorTickTime());

  // Round up to next major tick equivalent.
  var nextMajorTickPixel = Math.ceil(xScroll / majorTickPixelDistance);

  // Find the time equivalent of that major tick.
  var firstMajorTickTime = nextMajorTickPixel * majorTickTimeDelta;

  // Go backwards and fill in minor ticks.
  var minorTicksPerMajorTick = scale.getMinorTicksPerMajorTick();
  var minorTickDistance = majorTickPixelDistance / (minorTicksPerMajorTick + 1);
  var majorTickXPosition = nextMajorTickPixel * majorTickPixelDistance -
      xScroll;
  var mark = majorTickXPosition - minorTickDistance;
  if (minorTicksPerMajorTick > 0) {
    while (mark >= 0) {
      this.drawMinorTick_(context2d, this.computeWholePixelPosition_(mark));
      mark -= minorTickDistance;
    }
  }

  // Configure the time format.
  var timeFormatter = this.timeFormatter_;
  var majorTickYValue = this.rulerMajorTickYValue_;
  var textHeight = majorTickYValue - 3;
  var timeUnit = scale.getTimeUnit();
  context2d.textAlign = 'center';
  while (majorTickXPosition < canvasWidth) {
    this.drawMajorTick_(context2d, majorTickXPosition,
        timeFormatter.formatTimeGivenScale(firstMajorTickTime, scale));
    mark = majorTickXPosition;
    for (var i = 0; i < minorTicksPerMajorTick; ++i) {
      mark += minorTickDistance;
      this.drawMinorTick_(context2d, this.computeWholePixelPosition_(mark));
    }

    majorTickXPosition += majorTickPixelDistance;
    firstMajorTickTime += majorTickTimeDelta;
  }

  context2d.closePath();
  context2d.stroke();
};

/**
 * Draws a major tick. Assumes the path has begun.
 * @param {!CanvasRenderingContext2D} context2d The 2D context used to draw the
 *     ruler.
 * @param {number} xPosition The x position in pixels at which to draw the tick.
 * @param {string=} opt_label If provided, labels the tick.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.drawMajorTick_ =
    function(context2d, xPosition, opt_label) {
  var rulerMajorTickYValue = this.rulerMajorTickYValue_;
  this.drawVerticalLine_(
      context2d, xPosition, rulerMajorTickYValue, this.rulerHeight_);
  if (opt_label) {
    // TODO(chizeng): Cache the subtraction.
    context2d.fillText(opt_label, xPosition, this.majorTickTopPosition_);
  }
};

/**
 * Draws a minor tick. Assumes the path has begun.
 * @param {!CanvasRenderingContext2D} context2d The 2D context used to draw the
 *     ruler.
 * @param {number} xPosition The x position in pixels at which to draw the minor
 *     tick.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.drawMinorTick_ =
    function(context2d, xPosition) {
  this.drawVerticalLine_(
      context2d, xPosition, this.rulerMinorTickYValue_, this.rulerHeight_);
};

/**
 * Draws a vertical line. Assumes the path has begun.
 * @param {!CanvasRenderingContext2D} context2d The 2D context used to draw the
 *     ruler.
 * @param {number} xPosition The x position in pixels at which to draw the line.
 * @param {number} initialYPosition The Y position of the top of the line.
 * @param {number} height The height of the vertical line.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.drawVerticalLine_ =
    function(context2d, xPosition, initialYPosition, height) {
  xPosition += 0.5;
  context2d.moveTo(xPosition, initialYPosition);
  context2d.lineTo(xPosition, height);
};

/**
 * Computes a whole pixel position given a decimal point pixel position.
 * @param {number} decimalPixelPosition The unrounded pixel position.
 * @return {number} A whole number that represents the pixel position.
 * @private
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.computeWholePixelPosition_ =
    function(decimalPixelPosition) {
  return Math.floor(decimalPixelPosition);
};

/**
 * @return {!Element} The canvas element rendering the ruler.
 */
audioCat.ui.tracks.TimeDomainRuler.prototype.getDom = function() {
  return /** @type {!HTMLCanvasElement} */ (this.context2d_.canvas);
};
