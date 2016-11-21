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
goog.provide('audioCat.ui.tooltip.ToolTip');


goog.require('audioCat.ui.widget.Widget');
goog.require('goog.events');
goog.require('goog.style');



/**
 * A tooltip that appears by the mouse. Attach this to the document body.
 * @param {!audioCat.utility.DomHelper} domHelper Interacts with the DOM.
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager Manages
 *     resizing and scrolling.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.tooltip.ToolTip = function(domHelper, scrollResizeManager) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;

  /**
   * Whether the tooltip's currently visible.
   * @private {boolean}
   */
  this.visible_ = false;

  var container = domHelper.createDiv(goog.getCssName('toolTipContainer'));
  audioCat.ui.tooltip.ToolTip.base(this, 'constructor', container);
};
goog.inherits(audioCat.ui.tooltip.ToolTip, audioCat.ui.widget.Widget);


/**
 * @return {boolean} Whether the tooltip is currently visible.
 */
audioCat.ui.tooltip.ToolTip.prototype.getVisible = function() {
  return this.visible_;
};


/**
 * Sets the inner raw HTML of the tool tip.
 * @param {string|!Element} content The raw inner HTML. Or an element.
 */
audioCat.ui.tooltip.ToolTip.prototype.setContent = function(content) {
  if (goog.isString(content)) {
    this.domHelper_.setRawInnerHtml(this.getDom(), content);
  } else {
    var container = this.getDom();
    this.domHelper_.removeChildren(container);
    this.domHelper_.appendChild(container, content);
  }
};


/**
 * Sets whether the tooltip is visible.
 * @param {boolean} visible Whether the tooltip will be visible.
 * @param {number=} opt_x The initial X position of the mouse if showing.
 * @param {number=} opt_y The initial Y position of the mouse if showing.
 */
audioCat.ui.tooltip.ToolTip.prototype.setVisible = function(
    visible, opt_x, opt_y) {
  if (visible != this.visible_) {
    // A change in visibility!
    var visibleClassName = goog.getCssName('visibleTooltip');
    this.visible_ = visible;
    var domHelper = this.domHelper_;
    if (visible) {
      if (goog.isDef(opt_x) && goog.isDef(opt_y)) {
        // Initial mouse position specified. Enforce it.
        this.positionToolTip_(opt_x, opt_y);
      }
      goog.dom.classes.add(this.getDom(), visibleClassName);
      domHelper.listenForMove(
          domHelper.getDocument(), this.handleVisibleMouseMove_, false, this);
    } else {
      goog.dom.classes.remove(this.getDom(), visibleClassName);
      domHelper.unlistenForMove(
          domHelper.getDocument(), this.handleVisibleMouseMove_, false, this);
    }
  }
};


/**
 * Handles a mouse move when visible.
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
audioCat.ui.tooltip.ToolTip.prototype.handleVisibleMouseMove_ = function(event) {
  this.positionToolTip_(
      this.domHelper_.obtainClientX(event),
      this.domHelper_.obtainClientY(event));
};


/**
 * Positions the tooltip based on where the mouse is.
 * Assumes that the tooltip is visible.
 * @param {number} clientX The X position of the mouse relative to viewport.
 * @param {number} clientY The Y position of the mouse relative to viewport.
 * @private
 */
audioCat.ui.tooltip.ToolTip.prototype.positionToolTip_ = function(
    clientX, clientY) {
  var toolTipBounds = goog.style.getBounds(this.getDom());
  var marginFromMouse = 10;
  if (clientX > this.scrollResizeManager_.getWindowWidth() / 2) {
    // If the mouse is on the right, position the tooltip to the left.
    // Also include some distance from the mouse.
    clientX -= (toolTipBounds.width + marginFromMouse);
  } else {
    // Position the tooltip to the right. Include some distance from the mouse.
    clientX += marginFromMouse;
  }
  if (clientY > this.scrollResizeManager_.getWindowHeight() / 2) {
    // If the mouse is on the bottom half, position the tooltip on the top.
    // Also include some distance from the mouse.
    clientY -= (toolTipBounds.height + marginFromMouse);
  } else {
    // Position the tooltip on the bottom. Include some distance from the mouse.
    clientY += marginFromMouse;
  }
  var container = this.getDom();
  container.style.left = '' + clientX + 'px';
  container.style.top = '' + clientY + 'px';
};
