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
goog.provide('audioCat.ui.window.ScrollResizeManager');

goog.require('audioCat.ui.window.EventType');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.style');



/**
 * Manages what happens when the user scrolls or resizes the window.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.window.ScrollResizeManager = function(domHelper) {
  goog.base(this);

  /**
   * Facilitates interactions with the DOM.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Whether to have other entities such as the horizontal scroll bar compute
   * horizontal scroll at the moment. We may want to avoid doing so if we want
   * to perform an atomic operation before computing the full scroll width. For
   * example, when we split a section, we remove the original section and add
   * two more. We want to compute the whole scroll length after all these
   * operations complete.
   * @private
   */
  this.goodTimeToComputeHorizontalLength_ = false;

  /**
   * A list of elements whose left offsets are fixed.
   * @private {!Array.<!Element>}
   */
  this.fixedLeftElements_ = [];

  /**
   * A list of elements whose top offsets are fixed.
   * @private {!Array.<!Element>}
   */
  this.fixedTopElements_ = [];

  /**
   * A list of functions to call when the user scrolls the window.
   * Each of these functions can take 4 numeric arguments, which are whole
   * numbers denoting how many pixels the user has scrolled (1) from the left
   * and (2) from the top (3) the window width (4) the window height.
   * @private {!Array.<!Function>}
   */
  this.callbacks_ = [];

  /**
   * A list of functions to call when the user resizes the window.
   * Each of these functions can take 4 numeric arguments, which are whole
   * numbers denoting how many pixels the user has scrolled (1) from the left
   * and (2) from the top (3) the window width (4) the window height.
   * @private {!Array.<!function(number, number, number, number)>}
   */
  this.resizeCallbacks_ = [];

  var documentScroll = this.getDocumentScroll_();
  /**
   * The left/right scroll in pixels. A whole number.
   * @private {number}
   */
  this.leftRightScroll_ = documentScroll.x;

  /**
   * The top/bottom scroll in pixels. A whole number.
   * @private {number}
   */
  this.topBottomScroll_ = documentScroll.y;

  var viewportSize = domHelper.getViewportSize();
  /**
   * The width of the window in pixels. A whole number.
   * @private {number}
   */
  this.windowWidth_ = viewportSize.width;

  /**
   * The height of the window in pixels. A whole number.
   * @private {number}
   */
  this.windowHeight_ = viewportSize.height;

  goog.events.listen(domHelper.getWindow(),
      'resize', this.handleWindowResize_, false, this);
  goog.events.listen(domHelper.getDocument(),
      'scroll', this.handleDocumentScrollEvent_, false, this);
};
goog.inherits(
    audioCat.ui.window.ScrollResizeManager, audioCat.utility.EventTarget);


/**
 * The width of the sidebar in pixels.
 * @const {number}
 */
audioCat.ui.window.ScrollResizeManager.SIDEBAR_WIDTH = 160;


/**
 * Handles window resize.
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.handleWindowResize_ =
    function() {
  var viewportSize = this.domHelper_.getViewportSize();
  this.windowWidth_ = viewportSize.width;
  this.windowHeight_ = viewportSize.height;
  var resizeCallbacks = this.resizeCallbacks_;
  for (var i = 0; i < resizeCallbacks.length; ++i) {
    resizeCallbacks[i](
        this.leftRightScroll_,
        this.topBottomScroll_,
        this.windowWidth_,
        this.windowHeight_);
  }
  this.fixElements_();
};

/**
 * @return {number} The left/right scroll of the document.
 */
audioCat.ui.window.ScrollResizeManager.prototype.getLeftRightScroll =
    function() {
  return this.leftRightScroll_;
};

/**
 * @return {number} The top/bottom scroll of the document.
 */
audioCat.ui.window.ScrollResizeManager.prototype.getTopBottomScroll =
    function() {
  return this.topBottomScroll_;
};

/**
 * @return {number} The width of the window. A whole number.
 */
audioCat.ui.window.ScrollResizeManager.prototype.getWindowWidth = function() {
  return this.windowWidth_;
};

/**
 * @return {number} The height of the window. A whole number.
 */
audioCat.ui.window.ScrollResizeManager.prototype.getWindowHeight = function() {
  return this.windowHeight_;
};

/**
 * Registers an element as one whose offset from the left (the CSS left
 * property) will change as the user scrolls to make it seem as if the element
 * did not move left or right on the screen. Does not work for mobile.
 * @param {!Element} element The element to make fixed in terms of left/right
 *     directions.
 */
audioCat.ui.window.ScrollResizeManager.prototype.fixLeft = function(element) {
  if (!FLAG_MOBILE) {
    // Do not manually fix during scroll for mobile - it looks choppy.
    this.fixedLeftElements_.push(element);
    this.adjustLeftRightFixed_(element);
  }
};

/**
 * Removes an element from the registry of elements fixed to the left.
 * @param {!Element} element The element.
 * @return {boolean} True if and only if the element was removed.
 */
audioCat.ui.window.ScrollResizeManager.prototype.removeFromFixLeft =
    function(element) {
  return goog.array.remove(this.fixedLeftElements_, element);
};

/**
 * Registers an element as one whose offset from the top (the CSS top property)
 * will change as the user scrolls to make it seem as if the element did not
 * move up or down on the screen.
 * @param {!Element} element The element to make fixed in terms of up/down
 *     directions.
 */
audioCat.ui.window.ScrollResizeManager.prototype.fixTop = function(element) {
  this.fixedTopElements_.push(element);
  this.adjustTopBottomFixed_(element);
};

/**
 * Adds a callback to be run when the user resizes or scrolls the window.
 * // TODO(chizeng): Rename this function to include the resize part ...
 * @param {!Function} callback A callback to be run when the
 *     user resizes or scrolls the window. The callback receives as arguments
 *     the left/right scroll, top/bottom scroll, the window width, and the
 *     window height in pixels.
 * @param {boolean=} opt_callUponAdd Whether to call the method added right
 *     after the method to the list of functions to call.
 */
audioCat.ui.window.ScrollResizeManager.prototype.callAfterScroll =
    function(callback, opt_callUponAdd) {
  // TODO(chizeng): Name this function appropriately.
  this.callbacks_.push(callback);
  // Call this function now so that the page takes scroll into account upon
  // loading.
  if (opt_callUponAdd) {
    callback(this.leftRightScroll_, this.topBottomScroll_,
        this.windowWidth_, this.windowHeight_);
  }
};

/**
 * Adds a callback to be run when the user resizes the window.
 * @param {!Function} callback A callback to be run when the
 *     user resizes the window. The callback receives as arguments
 *     the left/right scroll, top/bottom scroll, the window width, and the
 *     window height in pixels.
 */
audioCat.ui.window.ScrollResizeManager.prototype.callAfterResize =
    function(callback) {
  this.resizeCallbacks_.push(callback);
};

/**
 * Removes a callback from the list of functions to call when the user scrolls.
 * The callback must be already registered with the scroll resize manager.
 * @param {!Function} callback The callback to remove.
 */
audioCat.ui.window.ScrollResizeManager.prototype.removeCallAfterScroll =
    function(callback) {
  // This returns true if a callback was indeed removed.
  var removeStatus = goog.array.remove(this.callbacks_, callback);

  // Do NOT put the call to remove in the assert parameter directly.
  // The compiler strips out all assert calls, so the removal side effect will
  // get stripped away. This subtle bug kept Chi awake for a long time.
  goog.asserts.assert(removeStatus);
};

/**
 * Obtains the document scroll object.
 * @return {!goog.math.Coordinate}
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.getDocumentScroll_ =
    function() {
  return this.domHelper_.getDocumentScroll();
};

/**
 * Manually sets the horizontal scroll. Used for cases like mobile in which we
 * implement our own scrolling.
 * @param {number} horizontalScroll The new horizontal scroll.
 */
audioCat.ui.window.ScrollResizeManager.prototype.setHorizontalScroll =
    function(horizontalScroll) {
  this.leftRightScroll_ = horizontalScroll;
  this.fixElements_();
};

/**
 * Handles document scrolling.
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.handleDocumentScrollEvent_ =
    function() {
  var documentScroll = this.getDocumentScroll_();
  if (!FLAG_MOBILE) {
    // We manually handle horizontal scrolling for mobile.
    this.leftRightScroll_ = documentScroll.x;
  }
  this.topBottomScroll_ = documentScroll.y;
  this.fixElements_();
};

/**
 * Fixes elements during window scroll assuming the currently recorded scroll
 * data.
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.fixElements_ = function() {
  var fixedLeftElements = this.fixedLeftElements_;
  var fixedTopElements = this.fixedTopElements_;

  if (!FLAG_MOBILE) {
    // Manually fixing looks choppy on a mobile device, so don't do it.
    var loopUpperBound = fixedLeftElements.length;
    for (var i = 0; i < loopUpperBound; ++i) {
      this.adjustLeftRightFixed_(fixedLeftElements[i]);
    }

    loopUpperBound = fixedTopElements.length;
    for (var i = 0; i < loopUpperBound; ++i) {
      this.adjustTopBottomFixed_(fixedTopElements[i]);
    }
  }

  var callbacks = this.callbacks_;
  loopUpperBound = callbacks.length;
  for (var i = 0; i < loopUpperBound; ++i) {
    callbacks[i](this.leftRightScroll_, this.topBottomScroll_,
        this.windowWidth_, this.windowHeight_);
  }
};

/**
 * Readjusts an element that is fixed left-right wise.
 * @param {!Element} element The element to readjust.
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.adjustLeftRightFixed_ =
    function(element) {
  goog.style.setStyle(element, 'left', String(this.leftRightScroll_) + 'px');
};

/**
 * Readjusts an element that is fixed top-bottom wise.
 * @param {!Element} element The element to readjust.
 * @private
 */
audioCat.ui.window.ScrollResizeManager.prototype.adjustTopBottomFixed_ =
    function(element) {
  goog.style.setStyle(element, 'top', String(this.topBottomScroll_) + 'px');
};

/**
 * Scrolls the window to a certain X and Y position (both in pixels).
 * @param {number} x The x position.
 * @param {number} y The y position.
 */
audioCat.ui.window.ScrollResizeManager.prototype.scrollTo = function(x, y) {
  this.domHelper_.getWindow().scrollTo(x, y);
};

/**
 * Gets whether now is a good time to compute horizontal scroll length. See
 * comments on the property for motivation for this.
 * @return {boolean} Whether now is a good time to do so.
 */
audioCat.ui.window.ScrollResizeManager.prototype.isGoodTimeForScrollCompute =
    function() {
  return this.goodTimeToComputeHorizontalLength_;
};

/**
 * Sets whether now is a good time to compute horizontal scroll length. See
 * comments on the property for motivation for this.
 *
 * Dispatches an event notifying other entities of the change.
 * @param {boolean} isGoodTime Whether now is a good time to do so.
 */
audioCat.ui.window.ScrollResizeManager.prototype.setIsGoodTimeForScrollCompute =
    function(isGoodTime) {
  this.goodTimeToComputeHorizontalLength_ = isGoodTime;
  this.dispatchEvent(
      audioCat.ui.window.EventType.GOOD_TIME_FOR_SCROLL_COMPUTE_CHANGED);
};

/**
 * Try to hack a full-screen experience.
 */
audioCat.ui.window.ScrollResizeManager.prototype.hackFullScreen = function() {
  // Some bizarre hack :/
  this.scrollTo(0, 1);
};

/**
 * Requests the browser to make an element take up the full screen.
 * @param {!Element} element That element.
 */
audioCat.ui.window.ScrollResizeManager.prototype.requestFullScreen =
    function(element) {
  var doc = this.domHelper_.getDocument();
  var fullScreenMethods = [
      'fullscreenElement',
      'webkitFullscreenElement'
    ];
  for (var i = 0; i < fullScreenMethods.length; ++i) {
    if (doc[fullScreenMethods[i]]) {
      // We found a full screen method that the browser supports. Yay, done.
      doc[fullScreenMethods[i]](element);
      return;
    }
  }
  goog.asserts.fail('No full screen method could be found.');
};
