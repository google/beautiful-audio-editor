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
goog.provide('audioCat.ui.envelope.EnvelopeRenderer');

goog.require('audioCat.state.command.AddControlPointCommand');
goog.require('audioCat.state.command.MoveControlPointCommand');
goog.require('audioCat.state.command.RemoveControlPointCommand');
goog.require('audioCat.state.envelope.ControlPointChange');
goog.require('audioCat.state.envelope.events');
goog.require('audioCat.ui.envelope.ControlPointDragger');
goog.require('audioCat.ui.envelope.events');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.style');


/**
 * Renders an envelope. By default, the width is the width of the window.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.envelope.Envelope} envelope The envelope to render.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools 2D
 *     contexts so we don't create too many contexts.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager
 *     Manages scrolling and resizing of the document.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Maintains and updates the current time-domain
 *     scale.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history, enabling undo / redo.
 * @param {string} containerClassName The name of the class for the container
 *     for the envelope renderer.
 * @param {string=} opt_bottomLabel What to label the bottom value as. Defaults
 *     the string conversion of the minimum value.
 * @param {string=} opt_topLabel What to label the top value as. Defaults to the
 *     string conversion of the maximum value.
 * @constructor
 */
audioCat.ui.envelope.EnvelopeRenderer = function(
    idGenerator,
    domHelper,
    envelope,
    context2dPool,
    scrollResizeManager,
    timeDomainScaleManager,
    commandManager,
    containerClassName,
    opt_bottomLabel,
    opt_topLabel) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages command history.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * The height of the renderer in pixels. A whole number.
   * @private {number}
   */
  this.height_ = 90;

  /**
   * The width of the renderer in pixels. A whole number.
   * @private {number}
   */
  this.width_ = scrollResizeManager.getWindowWidth();

  /**
   * The envelope to render.
   * @private {!audioCat.state.envelope.Envelope}
   */
  this.envelope_ = envelope;

  /**
   * Pools contexts so we don't create too many.
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  var container = domHelper.createElement('div');
  goog.dom.classes.add(container, goog.getCssName('envelopeRenderer'));
  goog.dom.classes.add(container, containerClassName);

  /**
   * The container for the envelope renderer.
   * @private {!Element}
   */
  this.container_ = container;

  /**
   * Manages scrolling and resizing of the document.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Manages the scale of the time-domain
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * Maps from control point ID to its dragger.
   * @private {!Object<audioCat.utility.Id,
   *     !audioCat.ui.envelope.ControlPointDragger>}
   */
  this.draggerMapping_ = {};
  var numberOfControlPoints = envelope.getNumberOfControlPoints();
  for (var i = 0; i < numberOfControlPoints; ++i) {
    this.addControlPointDragger_(envelope.getControlPointAtIndex(i));
  }

  var context2d = context2dPool.retrieve2dContext();
  /**
   * The context for the canvas for rendering the envelope.
   * @private {!CanvasRenderingContext2D}
   */
  this.context2d_ = context2d;
  var canvas = context2d.canvas;
  canvas.height = this.height_;
  domHelper.appendChild(container, canvas);

  domHelper.listenForDownPress(
      canvas, this.handleNewControlPoint_, false, this);
  goog.events.listen(envelope,
      audioCat.state.envelope.events.CONTROL_POINTS_CHANGED,
      this.handleControlPointsChanged_, false, this);

  /**
   * The client X value when the previous control point drag began.
   * @private {number}
   */
  this.beginDragClientX_ = 0;

  /**
   * The client Y value when the previous control point drag began.
   * @private {number}
   */
  this.beginDragClientY_ = 0;

  /**
   * The time in seconds of the previous control point on drag begin.
   * @private {number}
   */
  this.beginDragTime_ = 0;

  /**
   * The value of the previous control point on drag begin.
   * @private {number}
   */
  this.beginDragValue_ = 0;

  /**
   * The control point dragger being dragged if there is one. Otherwise, null.
   * @private {audioCat.ui.envelope.ControlPointDragger}
   */
  this.draggerBeingDragged_ = null;

  /**
   * The time in ms at which the dragger had been clicked.
   * @private {number}
   */
  this.timeForBeginDrag_ = 0;

  /**
   * Whether we are the process of creating a new control point. The user may
   * still be moving the new control point around. In that case, we do not want
   * issue a command for both creating and moving the control point around. We
   * only want to issue a single command for creating the point.
   * @private {boolean}
   */
  this.creatingControlPoint_ = false;

  // Reposition the envelope based on the scroll now and from now on.
  // This call also draws the envelope since the 2nd parameter is true.
  /**
   * The function called when the user scrolls the window. It ensures that the
   * envelope does not drift upon scroll.
   * @private {!Function}
   */
  this.scrollCallback_ = goog.bind(this.handleScroll_, this);

  scrollResizeManager.callAfterScroll(this.scrollCallback_, true);
};

/**
 * Handles what happens when the page scrolls. Type-checking is suppressed due
 * to object keying issues.
 * @param {number} xScroll The horizontal scroll in pixels. A whole number.
 * @private
 * @suppress {checkTypes}
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleScroll_ =
    function(xScroll) {
  if (!FLAG_MOBILE) {
    // Repositioning on mobile devices is choppy, so we implemented our own
    // means of scrolling horizontally. Hence, don't offset it.
    this.getDom().style.left = String(xScroll) + 'px';
  }
  var mapping = this.draggerMapping_;
  for (var id in mapping) {
    // TODO(chizeng): Suppress this error instead of parsing an int.
    this.repositionDragger_(mapping[/** @type {audioCat.utility.Id} */ (id)]);
  }
  this.drawEnvelope_();
};

/**
 * Handles changes in control points. Additions, removals, and modifications.
 * @param {!audioCat.state.envelope.ControlPointsChangedEvent} event
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleControlPointsChanged_ =
    function(event) {
  var typeOfChange = event.getKind();
  var controlPoints = event.getControlPoints();
  switch (typeOfChange) {
    case audioCat.state.envelope.ControlPointChange.ADDED:
      for (var i = 0; i < controlPoints.length; ++i) {
        this.addControlPointDragger_(controlPoints[i]);
      }
      break;
    case audioCat.state.envelope.ControlPointChange.MODIFIED:
      // TODO(chizeng): Alter the control point dragger.
      for (var i = 0; i < controlPoints.length; ++i) {
        this.modifyControlPointDragger_(controlPoints[i]);
      }
      break;
    case audioCat.state.envelope.ControlPointChange.REMOVED:
      for (var i = 0; i < controlPoints.length; ++i) {
        this.removeControlPointDragger_(controlPoints[i]);
      }
      break;
  }
  this.drawEnvelope_();
};

/**
 * Removes the dragger for a control point. Does not redraw the envelope.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     to remove the dragger for.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.removeControlPointDragger_ =
    function(controlPoint) {
  var mapping = this.draggerMapping_;
  var dragger = mapping[controlPoint.getId()];
  var domHelper = this.domHelper_;
  domHelper.removeNode(dragger.getDom());
  delete mapping[controlPoint.getId()];
  dragger.cleanUp();
};

/**
 * Modifies the dragger for a control point.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     to modify the dragger for.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.modifyControlPointDragger_ =
    function(controlPoint) {
  var dragger = this.draggerMapping_[controlPoint.getId()];
  dragger.setX(this.computeXCoordinate_(controlPoint.getTime()));
  dragger.setY(this.convertValueToPixels_(controlPoint.getValue()));
};

/**
 * Adds a dragger for a control point.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     for which to add a dragger.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.addControlPointDragger_ =
    function(controlPoint) {
  var domHelper = this.domHelper_;
  var dragger = new audioCat.ui.envelope.ControlPointDragger(
      domHelper,
      controlPoint,
      this.computeXCoordinate_(controlPoint.getTime()),
      this.convertValueToPixels_(controlPoint.getValue()));
  this.draggerMapping_[controlPoint.getId()] = dragger;
  var draggerDom = dragger.getDom();
  dragger.listen(audioCat.ui.envelope.events.CONTROL_POINT_DOWN_PRESS,
      this.handleDraggerDownPress_, false, this);
  domHelper.appendChild(this.container_, draggerDom);
};

/**
 * Handles what happens when the user presses down on a dragger.
 * @param {!audioCat.ui.envelope.ControlPointDownPressEvent} event The event.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleDraggerDownPress_ =
    function(event) {
  var dragger = /** @type {!audioCat.ui.envelope.ControlPointDragger} */ (
      event.target);
  this.timeForBeginDrag_ = goog.now();
  var domHelper = this.domHelper_;
  // These clientX and clientY properties are not native.
  this.putInDragMode_(dragger, event.clientX, event.clientY);
};

/**
 * Puts a dragger in drag mode - making it being dragged.
 * @param {!audioCat.ui.envelope.ControlPointDragger} dragger The dragger.
 * @param {number} clientX The clientX upon beginning drag.
 * @param {number} clientY The clientY upon beginning drag.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.putInDragMode_ =
    function(dragger, clientX, clientY) {
  this.draggerBeingDragged_ = dragger;
  this.beginDragClientX_ = clientX;
  this.beginDragClientY_ = clientY;
  var controlPoint = dragger.getControlPoint();
  this.beginDragTime_ = controlPoint.getTime();
  this.beginDragValue_ = controlPoint.getValue();
  var domHelper = this.domHelper_;
  var doc = domHelper.getDocument();

  // Listen for mouse move.
  domHelper.listenForMove(doc, this.handleDraggerMove_, false, this);

  // Listen for mouse up. The last true argument means this listener cleans
  // itself up (ie, unlistens) after it is triggered once.
  domHelper.listenForUpPress(
      doc, this.handleDraggerUpPress_, false, this, true);
};

/**
 * Handles the moving of a control point dragger while its dragged.
 * @param {!goog.events.BrowserEvent} event The associated press event.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleDraggerMove_ =
    function(event) {
  // Do not cause scroll.
  event.preventDefault();

  var dragger = /** @type {!audioCat.ui.envelope.ControlPointDragger} */ (
      this.draggerBeingDragged_);
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var domHelper = this.domHelper_;
  var deltaX = domHelper.obtainClientX(event) - this.beginDragClientX_;
  var deltaY = this.beginDragClientY_ - domHelper.obtainClientY(event);
  var newTime = this.beginDragTime_ + scale.convertToSeconds(deltaX);
  var newValue = this.beginDragValue_ + this.computeValueUnits_(deltaY);
  if (newTime < 0) {
    newTime = 0;
  }
  var envelope = this.envelope_;
  var min = envelope.getMin();
  var max = envelope.getMax();
  if (newValue < min) {
    newValue = min;
  } else if (newValue > max) {
    newValue = max;
  }
  dragger.getControlPoint().set(newTime, newValue);
};

/**
 * Converts pixel units to value units. Scales based on the height.
 * @param {number} pixels Pixel units. Along the vertical.
 * @return {number} The corresponding value.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeValueUnits_ =
    function(pixels) {
  var envelope = this.envelope_;
  var valueRange = envelope.getMax() - envelope.getMin();
  return pixels * valueRange / this.height_;
};

/**
 * Handles mouse up, thus ending the drag of a control point.
 * @param {!goog.events.BrowserEvent} event The associated press event.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleDraggerUpPress_ =
    function(event) {
  // Do not cause scroll.
  event.preventDefault();

  var domHelper = this.domHelper_;
  var doc = domHelper.getDocument();
  var controlPoint = /** @type {!audioCat.ui.envelope.ControlPointDragger} */ (
      this.draggerBeingDragged_).getControlPoint();
  var envelope = this.envelope_;
  domHelper.unlistenForMove(doc, this.handleDraggerMove_, false, this);

  // No control point dragger is being moved now.
  this.draggerBeingDragged_ = null;

  if (this.creatingControlPoint_) {
    // We had been creating a new control point, not moving an existing one
    // around. Hence, don't issue another command for moving the control point
    // around.
    this.creatingControlPoint_ = false;
    return;
  }

  if (goog.now() - this.timeForBeginDrag_ < 200 &&
      Math.sqrt(
        Math.pow(domHelper.obtainClientX(event) - this.beginDragClientX_, 2) +
        Math.pow(domHelper.obtainClientY(event) - this.beginDragClientY_, 2)) <
            2) {
    // If the user just lightly tapped the point with proximity,
    // it's a deletion. Proximity meaning the user moved < 2 pixels.
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.RemoveControlPointCommand(
            envelope, controlPoint, this.idGenerator_));
  } else {
    // The drag was not a delete; it altered the location of a control point.
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.MoveControlPointCommand(
            controlPoint,
            this.beginDragTime_,
            this.beginDragValue_,
            controlPoint.getTime(),
            controlPoint.getValue(),
            this.idGenerator_));
  }
};

/**
 * Handles the addition of a new control point.
 * @param {!goog.events.BrowserEvent} event The associated press event.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.handleNewControlPoint_ =
    function(event) {
  // Do not cause scroll.
  event.preventDefault();

  // Turn this into a command.
  var domHelper = this.domHelper_;
  var envelope = this.envelope_;

  var xCoord;
  var yCoord;
  if (FLAG_MOBILE) {
    // For mobile elements, we don't scroll the envelope, so use the container
    // left / top offsets.
    var container = this.container_;
    var containerClientPosition = goog.style.getClientPosition(container);
    xCoord =
        domHelper.obtainClientX(event) - containerClientPosition.x;
    // The y coord should subtract out scroll since pageY includes scroll, but
    // getTopOffset does not include the scroll of the canvas container.
    // getTopOffset is the canvas's y coord relative to the track container.
    yCoord =
        domHelper.obtainClientY(event) - containerClientPosition.y;
  } else {
    xCoord = domHelper.obtainOffsetX(event);
    yCoord = domHelper.obtainOffsetY(event);
  }

  var controlPoint = envelope.createControlPoint(
      this.computeTime_(xCoord),
      this.computeValue_(yCoord));
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.AddControlPointCommand(
          envelope, controlPoint, this.idGenerator_));
  this.creatingControlPoint_ = true;
  var dragger = this.draggerMapping_[controlPoint.getId()];
  this.putInDragMode_(dragger,
      domHelper.obtainClientX(event), domHelper.obtainClientY(event));
};

/**
 * Draws the envelope once. Should be called when the user scrolls/resizes. Or
 * if the envelope model changes. Does not handle the removal or addition of
 * control points, however. That must be separately handled.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.drawEnvelope_ = function() {
  var context2d = this.context2d_;
  var canvas = context2d.canvas;
  var envelope = this.envelope_;
  var scrollResizeManager = this.scrollResizeManager_;
  this.width_ = scrollResizeManager.getWindowWidth();
  canvas.width = this.width_;
  context2d.clearRect(0, 0, this.width_, this.height_);

  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var leftPixelHeight;
  var rightPixelHeight;
  var numberOfControlPoints = envelope.getNumberOfControlPoints();

  context2d.beginPath();
  var startControlPointIndex = 0;
  var leftBoundIndex = envelope.obtainLowerBound(this.computeLeftTimeValue_());
  if (leftBoundIndex >= 0) {
    var controlPoint = envelope.getControlPointAtIndex(leftBoundIndex);
    context2d.moveTo(this.computeXCoordinate_(controlPoint.getTime()),
        this.convertValueToPixels_(controlPoint.getValue()));
    startControlPointIndex = leftBoundIndex + 1;
  } else {
    if (numberOfControlPoints == 0) {
      startControlPointIndex = 1;
      context2d.moveTo(0,
          this.convertValueToPixels_(envelope.getInitialValue()));
    } else {
      var controlPoint = envelope.getControlPointAtIndex(0);
      context2d.moveTo(0,
          this.convertValueToPixels_(controlPoint.getValue()));
    }
  }

  var rightBoundIndex = envelope.obtainUpperBound(
      this.computeRightTimeValue_());
  var finalControlPointIndex;
  var finalX;
  var finalY;
  if (rightBoundIndex >= 0) {
    finalControlPointIndex = rightBoundIndex;
    var controlPoint = envelope.getControlPointAtIndex(finalControlPointIndex);
    finalX = this.computeXCoordinate_(controlPoint.getTime());
    finalY = this.convertValueToPixels_(controlPoint.getValue());
  } else {
    finalX = this.width_;
    if (numberOfControlPoints == 0) {
      finalControlPointIndex = 0;
      finalY = this.convertValueToPixels_(envelope.getInitialValue());
      context2d.moveTo(0, finalY);
    } else {
      finalControlPointIndex = numberOfControlPoints - 1;
      var controlPoint = envelope.getControlPointAtIndex(
          finalControlPointIndex);
      finalY = this.convertValueToPixels_(controlPoint.getValue());
    }
  }

  for (var i = startControlPointIndex; i <= finalControlPointIndex; ++i) {
    var controlPoint = envelope.getControlPointAtIndex(i);
    var pointX = this.computeXCoordinate_(controlPoint.getTime());
    var pointY = this.convertValueToPixels_(controlPoint.getValue());
    context2d.lineTo(pointX, pointY);
    context2d.moveTo(pointX, pointY);
  }

  // Complete the canvas's right side drawing.
  context2d.lineTo(finalX, finalY);

  // Finally, draw all the lines we just made.
  context2d.closePath();
  context2d.lineWidth = 2;
  context2d.strokeStyle = '#BBE200'; // The light lime color.
  context2d.stroke();

  // Draw the labels.
  var leftLabelMargin = 3;
  context2d.fillStyle = '#FFCB0D'; // A light orange.
  var midPoint = (envelope.getMin() + envelope.getMax()) / 2;
  context2d.textBaseline = 'top';
  var topLevelYValue = 3;
  var topLabel = envelope.getTopLabel();
  context2d.fillText(topLabel, leftLabelMargin, topLevelYValue);
  context2d.fillText(
      envelope.getName(),
      2 * leftLabelMargin + context2d.measureText(topLabel).width,
      topLevelYValue);
  context2d.textBaseline = 'middle';
  var halfHeight = this.height_ / 2;
  var middleLabel = envelope.getMiddleLabel();
  context2d.fillText(middleLabel, leftLabelMargin, halfHeight);
  context2d.textBaseline = 'bottom';
  var height = this.height_;
  context2d.fillText(envelope.getBottomLabel(), leftLabelMargin, height);

  // Draw line in the middle.
  var envelopeMin = envelope.getMin();
  // +0.5 to turn off anti-aliasing.
  var defaultValuePixelHeight = 0.5 + (1 -
      (envelope.getInitialValue() - envelopeMin) /
          (envelope.getMax() - envelopeMin)) * height;
  context2d.beginPath();
  context2d.moveTo(
      leftLabelMargin * 2 + context2d.measureText(middleLabel).width,
      defaultValuePixelHeight);
  context2d.lineTo(this.width_, defaultValuePixelHeight);
  context2d.closePath();
  context2d.strokeStyle = '#ccc';
  context2d.lineCap = 'round';
  context2d.lineWidth = 1;
  context2d.stroke();
};

/**
 * Computes the time given the x coordinate of the canvas.
 * @param {number} xCoordinate The x coordinate.
 * @return {number} The time in seconds.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeTime_ =
    function(xCoordinate) {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var time = scale.convertToSeconds(xCoordinate +
      this.scrollResizeManager_.getLeftRightScroll());
  return time;
};

/**
 * Computes the value given the y coordinate of the canvas.
 * @param {number} yCoordinate The y coordinate.
 * @return {number} The value.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeValue_ =
    function(yCoordinate) {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  var height = this.height_;
  var envelope = this.envelope_;
  var min = envelope.getMin();
  var max = envelope.getMax();
  var value = (height - yCoordinate) * (max - min) / height + min;
  if (value > max) {
    value = max;
  }
  return value;
};

/**
 * Computes the x coordinate of the canvas given the time.
 * @param {number} time The time in seconds.
 * @return {number} A whole number. The x coordinate.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeXCoordinate_ =
    function(time) {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  return Math.round(scale.convertToPixels(time) -
      this.scrollResizeManager_.getLeftRightScroll());
};

/**
 * @return {number} The time value (in seconds) of the left bound.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeLeftTimeValue_ =
    function() {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  return scale.convertToSeconds(this.scrollResizeManager_.getLeftRightScroll());
};

/**
 * @return {number} The time value (in seconds) of the right bound.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.computeRightTimeValue_ =
    function() {
  var scale = this.timeDomainScaleManager_.getCurrentScale();
  return scale.convertToSeconds(
      this.width_ + this.scrollResizeManager_.getLeftRightScroll());
};

/**
 * Converts from envelope value to pixel location.
 * @param {number} value The value.
 * @return {number} The proportional pixel height. A whole number.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.convertValueToPixels_ =
    function(value) {
  var envelope = this.envelope_;
  var min = envelope.getMin();
  var height = this.height_;
  return height -
      Math.round(height * (value - min) / (envelope.getMax() - min));
};

/**
 * @return {!Element} The DOM element for the root of the envelope renderer.
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.getDom = function() {
  return this.container_;
};

/**
 * Repositions a control point dragger based on the current scale.
 * @param {!audioCat.ui.envelope.ControlPointDragger} dragger The dragger.
 * @private
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.repositionDragger_ =
    function(dragger) {
  var controlPoint = dragger.getControlPoint();
  dragger.setX(this.computeXCoordinate_(controlPoint.getTime()));
  dragger.setY(this.convertValueToPixels_(controlPoint.getValue()));
};

/**
 * Redraws the envelope and repositions draggers based on the current scale.
 * This should be called when the current zoom scale changes.
 * @suppress {checkTypes}
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.redrawAndReposition =
    function() {
  this.drawEnvelope_();
  var draggerMapping = this.draggerMapping_;
  for (var controlPointId in draggerMapping) {
    this.repositionDragger_(draggerMapping[controlPointId]);
  }
};

/**
 * Cleans up the envelope renderer. Call when the renderer is no longer needed.
 */
audioCat.ui.envelope.EnvelopeRenderer.prototype.cleanUp = function() {
  var domHelper = this.domHelper_;
  var context2d = this.context2d_;
  var envelope = this.envelope_;
  var unlistenFunction = goog.events.unlisten;

  domHelper.unlistenForDownPress(
      context2d.canvas, this.handleNewControlPoint_, false, this);
  unlistenFunction(envelope,
      audioCat.state.envelope.events.CONTROL_POINTS_CHANGED,
      this.handleControlPointsChanged_, false, this);

  this.context2dPool_.return2dContext(context2d);

  goog.object.forEach(this.draggerMapping_, function(controlPointDragger) {
    controlPointDragger.cleanUp();
  }, this);

  this.scrollResizeManager_.removeCallAfterScroll(this.scrollCallback_);
};
