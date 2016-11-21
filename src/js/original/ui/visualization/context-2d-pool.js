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
goog.provide('audioCat.ui.visualization.Context2dPool');

goog.require('goog.dom');


/**
 * Manages 2D canvases and allocates them as appropriate.
 * @constructor
 */
audioCat.ui.visualization.Context2dPool = function() {
  /**
   * Stores 2D canvas elements.
   * @private {!Array.<!CanvasRenderingContext2D>}
   */
  this.context2ds_ = [
      this.createNew2dContext_(),
      this.createNew2dContext_(),
      this.createNew2dContext_()
    ];
};

/**
 * Allocates a new context. Creates a new one if one had not been created yet.
 * @return {!CanvasRenderingContext2D}
 */
audioCat.ui.visualization.Context2dPool.prototype.retrieve2dContext =
    function() {
  var contexts = this.context2ds_;
  return (contexts.length) ? contexts.pop() : this.createNew2dContext_();
};

/**
 * Puts a canvas back so that it can be allocated in the future. May discard the
 * canvas if we have too many.
 * @param {!CanvasRenderingContext2D} context The 2D context allocated.
 */
audioCat.ui.visualization.Context2dPool.prototype.return2dContext =
    function(context) {
  // Store no more than this many canvases at any point.
  if (this.context2ds_.length < 18) {
    var canvas = context.canvas;
    canvas.className = '';
    context.clearRect(0, 0, canvas.width, canvas.height);
    var defaultStringValue = '';
    canvas.style.width = defaultStringValue;
    canvas.style.height = defaultStringValue;
    this.context2ds_.push(context);
  }
};

/**
 * @return {!CanvasRenderingContext2D} A newly created 2D context.
 * @private
 */
audioCat.ui.visualization.Context2dPool.prototype.createNew2dContext_ =
    function() {
  var canvasElement = /** @type {!Element} */ (
      goog.dom.createElement('canvas'));
  return /** @type {!CanvasRenderingContext2D} */ (
      canvasElement.getContext('2d'));
};
