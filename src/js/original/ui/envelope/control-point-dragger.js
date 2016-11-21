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
goog.provide('audioCat.ui.envelope.ControlPointDragger');

goog.require('audioCat.ui.envelope.ControlPointDownPressEvent');
goog.require('audioCat.ui.envelope.events');
goog.require('audioCat.ui.widget.Widget');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom.classes');


/**
 * Allows the user to drag the control point around.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.envelope.ControlPoint} controlPoint The control point
 *     this dragger modifies.
 * @param {number} x The X position in whole pixels.
 * @param {number} y The Y position in whole pixels.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.envelope.ControlPointDragger =
    function(domHelper, controlPoint, x, y) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The control point that this dragger modifies.
   * @private {!audioCat.state.envelope.ControlPoint}
   */
  this.controlPoint_ = controlPoint;

  /**
   * The scroll X offset in pixels.
   * @private {number}
   */
  this.scrollXOffset_ = 0;

  /**
   * The current x coordinate of the dragger's center in whole pixels.
   * @private {number}
   */
  this.x_ = x;

  /**
   * The current y coordinate of the dragger's center in whole pixels.
   * @private {number}
   */
  this.y_ = y;

  var container = domHelper.createElement('div');
  goog.dom.classes.add(container, goog.getCssName('controlPointDragger'));
  goog.base(this, container);

  // Listen for down press.
  domHelper.listenForDownPress(container, this.handleDownPress_, false, this);

  // Set DOM position.
  this.setX(x);
  this.setY(y);
};
goog.inherits(audioCat.ui.envelope.ControlPointDragger,
    audioCat.ui.widget.Widget);

/**
 * @return {!audioCat.state.envelope.ControlPoint} The control point.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.getControlPoint =
    function() {
  return this.controlPoint_;
};

/**
 * Handles a down press on the dragger.
 * @param {!goog.events.BrowserEvent} event The event associated with the down
 *     press.
 * @private
 */
audioCat.ui.envelope.ControlPointDragger.prototype.handleDownPress_ =
    function(event) {
  var domHelper = this.domHelper_;
  this.dispatchEvent(new audioCat.ui.envelope.ControlPointDownPressEvent(
      domHelper.obtainClientX(event), domHelper.obtainClientY(event)));
};

/**
 * Sets the X coordinate of the center of the dragger.
 * @param {number} x The X coordinate of the dragger in pixels.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.setX = function(x) {
  this.x_ = x;
  this.useLeftValue_();
};

/**
 * Sets the horizontal scroll offset.
 * @param {number} scrollXOffset The offset in pixels.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.setScrollXOffset =
    function(scrollXOffset) {
  this.scrollXOffset_ = scrollXOffset;
  this.useLeftValue_();
};

/**
 * @return {number} The X coordinate of the dragger in pixels.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.getX = function() {
  return this.x_;
};

/**
 * Determines and uses the left CSS style value based on the scroll offset
 * and the x coordinate.
 * @private
 */
audioCat.ui.envelope.ControlPointDragger.prototype.useLeftValue_ = function() {
  this.getDom().style.left =
      String(this.x_ - this.scrollXOffset_) + 'px';
};

/**
 * Sets the Y coordinate of the center of the dragger.
 * @param {number} y The Y coordinate of the dragger in pixels.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.setY = function(y) {
  this.getDom().style.top = String(y) + 'px';
  this.y_ = y;
};

/**
 * @return {number} The Y coordinate of the dragger in pixels.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.getY = function() {
  return this.y_;
};

/**
 * Cleans up the dragger. Call when the dragger is to be disposed of.
 */
audioCat.ui.envelope.ControlPointDragger.prototype.cleanUp = function() {
  this.domHelper_.unlistenForDownPress(
      this.getDom(), this.handleDownPress_, false, this);
  audioCat.ui.envelope.ControlPointDragger.base(this, 'cleanUp');
};

