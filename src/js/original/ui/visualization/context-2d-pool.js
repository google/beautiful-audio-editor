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
