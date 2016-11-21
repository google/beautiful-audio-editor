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
goog.provide('audioCat.ui.widget.FrequencySpectrumAnalyser');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.play.events');
goog.require('audioCat.state.effect.EventType');
goog.require('audioCat.state.effect.FilterEffect');
goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.asserts');
goog.require('goog.async.AnimationDelay');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A widget that visualizes the live frequency spectrum of audio.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools
 *     contexts so we do not make too many.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     audio.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between audio units.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {!audioCat.audio.Analyser} audioAnalyser Lets us poll it for almost
 *     live audio data.
 * @param {audioCat.state.effect.Effect=} activeEffect An effect to highlight in
 *     the visualization. Null or undefined if no effect to highlight.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.FrequencySpectrumAnalyser = function(
    domHelper,
    context2dPool,
    playManager,
    audioUnitConverter,
    effectManager,
    audioAnalyser,
    activeEffect) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  /**
   * The width of the canvas for visualizing frequency bins.
   * @private {number}
   */
  this.canvasWidth_ = audioCat.audio.Constant.ANALYSER_BUFFER_SIZE;

  /**
   * The height of the canvas for visualizing frequency bins.
   * @private {number}
   */
  this.canvasHeight_ = audioCat.audio.Constant.MAX_FREQUENCY_BIN_AMPLITUDE;

  /**
   * The min decibel value to use for visualizations.
   * @private {number}
   */
  this.minVisualizationDecibels_ =
      audioCat.audio.Constant.MIN_VISUALIZATION_DECIBELS;

  /**
   * The max decibel value to use for visualizations.
   * @private {number}
   */
  this.maxVisualizationDecibels_ =
      audioCat.audio.Constant.MAX_VISUALIZATION_DECIBELS;

  /**
   * The range in decibels to use for visualization.
   * @private {number}
   */
  this.visualizationDecibelRange_ =
      this.maxVisualizationDecibels_ - this.minVisualizationDecibels_;

  /**
   * The smallest representable decibel value on the canvas.
   * @private {number}
   */
  this.smallestRepresentableSample_ =
      audioUnitConverter.convertDecibelToSample(this.minVisualizationDecibels_);

  /**
   * The active effect to highlight. Null if none.
   * @private {audioCat.state.effect.Effect}
   */
  this.activeEffect_ = activeEffect || null;

  /**
   * The context to use for animations.
   * @private {!CanvasRenderingContext2D}
   */
  this.frequencyBarsContext2d_ = context2dPool.retrieve2dContext();
  var frequencyBarsCanvas = this.frequencyBarsContext2d_.canvas;
  frequencyBarsCanvas.width = this.canvasWidth_;
  frequencyBarsCanvas.height = this.canvasHeight_;
  goog.dom.classes.add(
      frequencyBarsCanvas, goog.getCssName('frequencyBarsCanvas'));

  /**
   * The context to use for drawing the line marking the chief frequency value.
   * @private {!CanvasRenderingContext2D}
   */
  this.chiefFrequencyLineContext2d_ = context2dPool.retrieve2dContext();
  var chiefFrequencyLineCanvas = this.chiefFrequencyLineContext2d_.canvas;
  chiefFrequencyLineCanvas.width = this.canvasWidth_;
  chiefFrequencyLineCanvas.height = this.canvasHeight_;

  /**
   * The most recent frequency to specify as the one to draw the special line
   * at. We store this value since we can't always immediately determine the
   * pixel location at which to draw the line since the sample rate might not be
   * available yet. Null if not yet provided.
   * @private {number?}
   */
  this.mostRecentLineFrequency_ = null;

  /**
   * The horizontal (x) location in pixels of the line that denotes a special
   * frequency like a cutoff frequency on the canvas. Null if no such line
   * should be drawn.
   * @private {number?}
   */
  this.frequencyLineXLocation_ = null;

  /**
   * Manages playing and pausing of audio.
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * Manages effects for a certain segment of audio.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  /**
   * Gives us live audio data.
   * @private {!audioCat.audio.Analyser}
   */
  this.audioAnalyser_ = audioAnalyser;

  // The base container for the whole widget.
  var container = domHelper.createDiv(
      goog.getCssName('frequencyAnalyserChart'));
  goog.base(this, container);

  var title = domHelper.createDiv('frequencyAnalyserTitle');
  domHelper.setTextContent(title, 'Output from ' +
      effectManager.getAudioSegmentLabel());
  domHelper.appendChild(container, title);

  // The container for all canvases that may overlap on top of one another.
  var canvasContainer = domHelper.createDiv(goog.getCssName('canvasContainer'));
  domHelper.appendChild(container, canvasContainer);

  // Include the canvas for drawing magnitude bars at various frequencies.
  domHelper.appendChild(canvasContainer, frequencyBarsCanvas);

  /**
   * The container for canvases that visualize responses from various effects.
   * @private {!Element}
   */
  this.effectResponseCanvasContainer_ =
      domHelper.createDiv('effectResponseCanvasContainer');
  domHelper.appendChild(canvasContainer, this.effectResponseCanvasContainer_);

  // Include the canvas for drawing the chief frequency line.
  domHelper.appendChild(canvasContainer, chiefFrequencyLineCanvas);

  // Add a left label.
  var leftLabel = domHelper.createDiv(goog.getCssName('leftLabel'));
  domHelper.setTextContent(leftLabel, '0 Hz');
  domHelper.appendChild(container, leftLabel);

  // Add a right label when we obtain the sample rate.
  if (goog.isNull(audioAnalyser.getSampleRate())) {
    goog.events.listenOnce(audioAnalyser, audioCat.state.events.ANALYSER_READY,
        this.handleAnalyserReady_, false, this);
  } else {
    this.addRightLabel_();
  }

  /**
   * The animation delay pegged to frame times. Used to update the indicated
   * time. Null when not playing.
   * @private {goog.async.AnimationDelay}
   */
  this.playAnimationDelay_ = null;

  // Respond to changes in play status.
  goog.events.listen(playManager, audioCat.audio.play.events.PLAY_BEGAN,
      this.handlePlayBegan_, false, this);
  goog.events.listen(playManager, audioCat.audio.play.events.PAUSED,
      this.handlePlayPause_, false, this);

  // Start animation iff we're playing.
  if (playManager.getPlayState()) {
    this.doAnimationLoop_();
  }

  /**
   * A mapping from effect ID to the 2D context used to visualize the response
   * from the effect.
   * @private {!Object.<audioCat.utility.Id, !CanvasRenderingContext2D>}
   */
  this.effectToContext2dMapping_ = {};

  /**
   * A mapping from effect ID to a list of listeners for various properties.
   * @private  {!Object.<audioCat.utility.Id, !Array.<!goog.events.Key>>}
   */
  this.effectToListenersMapping_ = {};

  // Do an initial draw of the frequency range regardless of playing or not.
  this.drawFrequencyBars_();
  this.drawChiefFrequencyLine_();

  var numberOfEffects = effectManager.getNumberOfEffects();
  for (var i = 0; i < numberOfEffects; ++i) {
    var currentEffect = effectManager.getEffectAtIndex(i);
    this.addResponseVisualization_(currentEffect, i);
  }

  // Remove the canvas and listeners when an effect is removed.
  goog.events.listen(effectManager,
      audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleSomeEffectRemoved_, false, this);
};
goog.inherits(audioCat.ui.widget.FrequencySpectrumAnalyser,
    audioCat.ui.widget.Widget);


/**
 * Adds a visualization for the response of an effect.
 * @param {!audioCat.state.effect.Effect} effect The effect to visualize the
 *     response for.
 * @param {number} index The index at which to insert the effect's
 *     visualization.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.
    addResponseVisualization_ = function(effect, index) {
  var context2d = this.context2dPool_.retrieve2dContext();
  var canvas = context2d.canvas;
  canvas.width = this.canvasWidth_;
  canvas.height = this.canvasHeight_;

  // Remember this context as belonging to the effect.
  this.effectToContext2dMapping_[effect.getId()] = context2d;

  if (effect instanceof audioCat.state.effect.FilterEffect) {
    this.updateFilterEffectVisualization_(effect);
    // Listen for changes in the effect's fields or in the effect being removed.
    var handleFilterEffectFieldChanged = goog.partial(
        this.updateFilterEffectVisualization_, effect);

    // Listen for changes in fields.
    this.effectToListenersMapping_[effect.getId()] = [
        goog.events.listen(effect.getFrequencyField(),
            audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
            handleFilterEffectFieldChanged, false, this),
        goog.events.listen(effect.getQField(),
            audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
            handleFilterEffectFieldChanged, false, this),
        goog.events.listen(effect.getGainField(),
            audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
            handleFilterEffectFieldChanged, false, this)
      ];
  }
  this.domHelper_.insertChildAt(
      this.effectResponseCanvasContainer_, canvas, index);
};

/**
 * Handles what happens when some effect is removed.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The event
 *     associated with the effect being removed.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.
    handleSomeEffectRemoved_ = function(event) {
  this.removeSomeEffect_(event.getEffect());
};

/**
 * Removes some effect from the visualization.
 * @param {!audioCat.state.effect.Effect} effect The effect to remove.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.removeSomeEffect_ =
    function(effect) {
  var effectId = effect.getId();

  // Remove event handlers.
  var eventHandlerKeys = this.effectToListenersMapping_[effectId];
  if (eventHandlerKeys) {
    var unlistenByKey = goog.events.unlistenByKey;
    for (var i = 0; i < eventHandlerKeys.length; ++i) {
      unlistenByKey(eventHandlerKeys[i]);
    }
  }
  delete this.effectToListenersMapping_[effectId];

  // Remove and return the canvas.
  var context2d = this.effectToContext2dMapping_[effectId];
  if (context2d) {
    this.domHelper_.removeNode(context2d.canvas);
    this.context2dPool_.return2dContext(context2d);
  }
  delete this.effectToContext2dMapping_[effectId];
};

/**
 * Updates the visualization for the response due to an effect.
 * @param {!audioCat.state.effect.FilterEffect} effect The effect to update the
 *     visualization for.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.
    updateFilterEffectVisualization_ = function(effect) {
  var context2d = this.effectToContext2dMapping_[effect.getId()];
  var canvas = context2d.canvas;
  var width = this.canvasWidth_;
  var height = this.canvasHeight_;
  this.clearCanvasForContext_(context2d);

  // Obtain the magnitude and phase responses. Store them in the arrays.
  var audioAnalyser = this.audioAnalyser_;
  var magitudeResponseArray = audioAnalyser.getMagResponseArray();
  var responseObtained = effect.getFrequencyResponse(
      audioAnalyser.getFrequencyArray(),
      magitudeResponseArray,
      audioAnalyser.getPhaseResponseArray());
  if (responseObtained) {
    // Only draw if we have a response.

    // Set some constants.
    var dbRange = 60;
    var pixelsPerDb = height / 2 / dbRange;

    // We have obtained a valid response. Visualize the filter effect.
    goog.asserts.assert(width == magitudeResponseArray.length);
    context2d.beginPath();
    var halfHeight = height / 2;

    // Move to the initial filter response position.
    var audioUnitConverter = this.audioUnitConverter_;
    var dbResponse = audioUnitConverter.convertSampleToDecibel(
        magitudeResponseArray[0]);
    var y = halfHeight - pixelsPerDb * dbResponse;
    context2d.moveTo(0.5, y + 0.5);

    // Visualize the rest of the filter.
    for (var i = 1; i < width; ++i) {
      var f = magitudeResponseArray[i];
      var response = magitudeResponseArray[i];
      dbResponse = this.audioUnitConverter_.convertSampleToDecibel(
          response);
      // Simulate two chained Biquads (for 4-pole lowpass)
      dbResponse += dbResponse;
      y = halfHeight - pixelsPerDb * dbResponse;
      context2d.lineTo(i + 0.5, y + 0.5);
    }
    context2d.lineWidth = 2;

    var isActiveEffect = this.activeEffect_ &&
        this.activeEffect_.getId() == effect.getId();
    context2d.strokeStyle = isActiveEffect ? '#f00' : '#fff';
    context2d.stroke();
  }
};

/**
 * Sets the location of a vertical frequency line on the canvas of frequency
 * bins. Or specify null to make no such line appear (make it disappear).
 * @param {number?} lineFrequency The frequency at which to draw the line.
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.setLineFrequency =
    function(lineFrequency) {
  this.mostRecentLineFrequency_ = lineFrequency;
  var sampleRate = this.audioAnalyser_.getSampleRate();
  this.frequencyLineXLocation_ = goog.isNull(lineFrequency) ?
      null : this.computeXLocation_(lineFrequency);
  this.drawChiefFrequencyLine_();
};

/**
 * Computes the X pixel location within the canvas given a frequency value. Or
 * returns null if the sample rate is not yet available.
 * @param {number} frequency The frequency value.
 * @return {number?} The corresponding X location in the canvas. Or null if no
 *     sample rate available yet.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.computeXLocation_ =
    function(frequency) {
  var sampleRate = this.audioAnalyser_.getSampleRate();
  // The Nyquist frequency is half the sample rate.
  return goog.isNull(sampleRate) ?
      null : Math.round(2 * frequency * this.canvasWidth_ / sampleRate);
};

/**
 * @return {number} The width of the canvas for drawing frequency bins.
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.getCanvasWidth =
    function() {
  return this.canvasWidth_;
};

/**
 * Handles what happens when playing of audio begins.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.handlePlayBegan_ =
    function() {
  this.doAnimationLoop_();
};

/**
 * Begins the animation.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.doAnimationLoop_ =
    function() {
  var animationDelay = new goog.async.AnimationDelay(
      this.doPerVisualFrame_, undefined, this);
  animationDelay.start();
  this.playAnimationDelay_ = animationDelay;
};

/**
 * Draws, then requests more drawing on the next visual frame.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.doPerVisualFrame_ =
    function() {
  this.drawFrequencyBars_();
  this.doAnimationLoop_();
};

/**
 * Handles what happens when playing of audio pauses.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.handlePlayPause_ =
    function() {
  this.stopAnimation_();
  // This draw call clears the canvas.
  this.drawFrequencyBars_();
};

/**
 * Stops the animation if the animation had been playing. Otherwise, does
 * nothing.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.stopAnimation_ =
    function() {
  if (this.playAnimationDelay_) {
    this.playAnimationDelay_.stop();
    this.playAnimationDelay_ = null;
  }
};

/**
 * Draws the frequency bars based on current data.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.drawFrequencyBars_ =
    function() {
  // Obtain the latest frequency information.
  var bytes = this.audioAnalyser_.getByteFrequencyData();

  var context2d = this.frequencyBarsContext2d_;
  var width = this.canvasWidth_;
  var height = this.canvasHeight_;
  this.clearCanvasForContext_(context2d);

  if (bytes && this.playAnimationDelay_) {
    // Only draw frequency bars if we have data.
    var maxSampleValue = audioCat.audio.Constant.MAX_FREQUENCY_BIN_AMPLITUDE;
    context2d.beginPath();
    for (var i = 0; i < width; ++i) {
      // Add 0.5 to prevent anti-aliasing.
      var xPosition = i + 0.5;
      context2d.moveTo(i, height);
      // Compute the Y scale length of the sample value.
      context2d.lineTo(i, this.obtainYValue_(bytes[i] / maxSampleValue));
    }
    context2d.strokeStyle = '#00f';
    context2d.stroke();
  }
};

/**
 * Draws the line marking the chief frequency value.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.drawChiefFrequencyLine_ =
    function() {
  var lineXLocation = this.frequencyLineXLocation_;
  if (!goog.isNull(lineXLocation)) {
    var context2d = this.chiefFrequencyLineContext2d_;
    this.clearCanvasForContext_(context2d);

    // We still need to draw that special frequency line.
    context2d.beginPath();
    context2d.moveTo(lineXLocation, 0);
    context2d.lineTo(lineXLocation, this.canvasHeight_);
    context2d.closePath();
    context2d.strokeStyle = '#bdff44'; // A light lime color.
    context2d.stroke();
  }
};

/**
 * Clears a given canvas related to this widget.
 * @param {!CanvasRenderingContext2D} context2d The 2D context for the canvas
 *     to clear.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.clearCanvasForContext_ =
    function(context2d) {
  context2d.clearRect(0, 0, this.canvasWidth_, this.canvasHeight_);
};

/**
 * Given a sample magnitude from 0 to 1, converts it to a height Y value
 * endpoint.
 * @param {number} magnitude
 * @return {number} The Y position in the visualization.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.obtainYValue_ =
    function(magnitude) {
  // TODO(chizeng): Re-activate this if we decide to go back to using decibels.
  // if (magnitude < this.smallestRepresentableSample_) {
  //   // This magnitude deserves no line.
  //   return height;
  // }
  // var decibels = this.audioUnitConverter_.convertSampleToDecibel(magnitude);
  // var minDecibels = this.minVisualizationDecibels_;
  // var height = this.canvasHeight_;
  // var lineLength = minDecibels +
  //     (decibels - minDecibels) * height / this.visualizationDecibelRange_;
  // return height - lineLength;
  return this.canvasHeight_ * (1 - magnitude);
};

/**
 * Handles what happens when the analyser becomes ready.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.handleAnalyserReady_ =
    function() {
  // Add the rightward label corresponding to the largest frequency, which we
  // can now compute since we have the sample rate.
  this.addRightLabel_();
  // Do a draw after setting where the special line should be.
  if (!goog.isNull(this.mostRecentLineFrequency_)) {
    this.frequencyLineXLocation_ = this.computeXLocation_(
        this.mostRecentLineFrequency_);
  }
  this.drawChiefFrequencyLine_();
};

/**
 * Adds the right label to the visualization.
 * @private
 */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.addRightLabel_ =
    function() {
  var domHelper = this.domHelper_;
  var rightLabel = domHelper.createDiv(goog.getCssName('rightLabel'));
  // The Nyquist frequency is half the sampling rate. The highest frequency of
  // our project thus cannot exceed half the sampling rate.
  domHelper.setTextContent(
      rightLabel, String(this.audioAnalyser_.getSampleRate() / 2) + ' Hz');
  domHelper.appendChild(this.getDom(), rightLabel);
};

/** @override */
audioCat.ui.widget.FrequencySpectrumAnalyser.prototype.cleanUp = function() {
  // Stop animating if we had been animating.
  this.stopAnimation_();

  // Unlisten to various events.
  var unlistenFunction = goog.events.unlisten;
  unlistenFunction(this.audioAnalyser_,
      audioCat.state.events.ANALYSER_READY, this.addRightLabel_, false, this);
  unlistenFunction(this.playManager_, audioCat.audio.play.events.PLAY_BEGAN,
      this.handlePlayBegan_, false, this);
  unlistenFunction(this.playManager_, audioCat.audio.play.events.PAUSED,
      this.handlePlayPause_, false, this);
  unlistenFunction(this.effectManager_,
      audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleSomeEffectRemoved_, false, this);

  // Return contexts back to the pool so other entities can use it.
  var context2dPool = this.context2dPool_;
  context2dPool.return2dContext(this.frequencyBarsContext2d_);
  context2dPool.return2dContext(this.chiefFrequencyLineContext2d_);

  // Remove all resources associated with effects.
  var effectManager = this.effectManager_;
  var numberOfEffects = effectManager.getNumberOfEffects();
  for (var i = 0; i < numberOfEffects; ++i) {
    this.removeSomeEffect_(effectManager.getEffectAtIndex(i));
  }

  audioCat.ui.widget.FrequencySpectrumAnalyser.base(this, 'cleanUp');
};
