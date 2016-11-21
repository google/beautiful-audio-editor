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
goog.provide('audioCat.ui.toolbar.item.Item');
goog.provide('audioCat.ui.toolbar.item.Item.createIcon');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.asserts');
goog.require('goog.dom.classes');


/**
 * The base abstract class for an item that a user can interact with in a
 * toolbar.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Maintains
 *     and updates the current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @param {string} label The label to apply to this button. It's what screen
 *     readers will say when this button is in focus. Can be changed.
 * @param {audioCat.state.editMode.EditModeName=} opt_activeEditModeName The
 *     mode in which to make this item active. If false, no such mode exists.
 * @param {boolean=} opt_nonHoverable If true, the item lacks a pronounced
 *     hover effect that occurs when the user mouses over the item.
 * @param {string=} opt_description A description of the item. May appear in a
 *     tooltip.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.toolbar.item.Item = function(
    domHelper,
    editModeManager,
    actionManager,
    toolTip,
    label,
    opt_activeEditModeName,
    opt_nonHoverable,
    opt_description) {
  /**
   * Maintains and updates the current edit mode.
   * @protected {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager = editModeManager;

  /**
   * A description of the item. Null if none.
   * @private {?string}
   */
  this.description_ = opt_description || null;

  /**
   * Facilitates interactions with the DOM.
   * @protected {!audioCat.utility.DomHelper}
   */
  this.domHelper = domHelper;

  /**
   * Manages various high-level actions.
   * @protected {!audioCat.action.ActionManager}
   */
  this.actionManager = actionManager;

  /**
   * @private {!audioCat.ui.tooltip.ToolTip}
   */
  this.toolTip_ = toolTip;

  /**
   * Whether the user is currently moused over this item.
   * @private {boolean}
   */
  this.mousedOver_ = false;

  /**
   * Whether this item is enabled.
   * @private {boolean}
   */
  this.enabled_ = true;

  /**
   * The mode in which to make this item active. Or null if no such mode exists.
   * @private {?audioCat.state.editMode.EditModeName}
   */
  this.activeEditModeName_ = opt_activeEditModeName || null;

  // Make the container tab-able.
  var container = domHelper.createElement('div');
  domHelper.setTabIndex(container, 0);

  if (!opt_nonHoverable) {
    // Append the background of element for a hover effect.
    var backgroundElement = domHelper.createElement('div');
    goog.dom.classes.add(
        backgroundElement, goog.getCssName('toolbarItemBackgroundElement'));
    domHelper.appendChild(container, backgroundElement);
  }

  // Append the crux of the item: the icon and graphics.
  domHelper.appendChild(container, this.getInternalDom());
  goog.dom.classes.add(container, goog.getCssName('toolbarItem'));
  goog.base(this, container);
  this.setAriaLabel(label);

  /**
   * Whether this toolbar item is active. Initially inactive.
   * @private {boolean}
   */
  this.activeState_ = false;

  // When the user hovers over the item, display description.  Hide on out.
  domHelper.listenForMouseOver(container, this.handleMouseOver_, false, this);
  domHelper.listenForMouseOut(container, this.handleMouseOut_, false, this);
};
goog.inherits(audioCat.ui.toolbar.item.Item, audioCat.ui.widget.Widget);

/**
 * Handles the user mousing over the item.
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
audioCat.ui.toolbar.item.Item.prototype.handleMouseOver_ = function(event) {
  this.mousedOver_ = true;
  // Only show the description in a tooltip if the item has a description.
  if (this.description_) {
    this.toolTip_.setContent(this.description_);
    this.toolTip_.setVisible(
        true,
        this.domHelper.obtainClientX(event),
        this.domHelper.obtainClientY(event));
  }
};

/**
 * Handles the user mousing away from the item.
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
audioCat.ui.toolbar.item.Item.prototype.handleMouseOut_ = function(event) {
  this.mousedOver_ = false;
  this.toolTip_.setVisible(false);
};

/**
 * Sets the description. Null for none.
 * @param {?string} description
 */
audioCat.ui.toolbar.item.Item.prototype.setDescription = function(description) {
  this.description_ = description;
  if (!description) {
    this.toolTip_.setVisible(false);
  }

  // Update the tooltip if the user has moused over.
  if (this.mousedOver_ && this.toolTip_.getVisible()) {
    goog.asserts.assert(description);
    this.toolTip_.setContent(description);
  }
};

/**
 * @return {?string} A description of the item. Null if none.
 */
audioCat.ui.toolbar.item.Item.prototype.getDescription = function() {
  return this.description_;
};

/**
 * @return {?audioCat.state.editMode.EditModeName} The mode in which to make
 * this item active. Or null if no such mode exists.
 */
audioCat.ui.toolbar.item.Item.prototype.getActiveEditModeName = function() {
  return this.activeEditModeName_;
};

/**
 * @return {!Element} The internal DOM representation of this item.
 */
audioCat.ui.toolbar.item.Item.prototype.getInternalDom = goog.abstractMethod;

/**
 * Sets whether this toolbar item is perceived as enabled.
 * @param {boolean} enabledState The enabled state visualized.
 */
audioCat.ui.toolbar.item.Item.prototype.setVisualizeEnabledState =
    function(enabledState) {
  this.enabled_ = enabledState;
  var functionToUse = (enabledState) ?
      goog.dom.classes.remove : goog.dom.classes.add;
  functionToUse(this.getDom(), goog.getCssName('disabledToolbarItem'));
};

/**
 * @return {boolean} Whether this item is enabled.
 */
audioCat.ui.toolbar.item.Item.prototype.getEnabledState = function() {
  return this.enabled_;
};

/**
 * Sets the active state of this toolbar item.
 * @param {boolean} activeState The active state to set this item.
 */
audioCat.ui.toolbar.item.Item.prototype.setActiveState = function(activeState) {
  this.activeState_ = activeState;
  var container = this.getDom();
  if (activeState) {
    goog.dom.classes.add(container, goog.getCssName('activeToolbarItem'));
  } else {
    goog.dom.classes.remove(container, goog.getCssName('activeToolbarItem'));
  }
};

/**
 * @return {boolean} Whether this item is active.
 */
audioCat.ui.toolbar.item.Item.prototype.getActiveState = function() {
  return this.activeState_;
};

/**
 * Switches modes to that of this current item (if this item represents an edit
 * mode).
 * @protected
 */
audioCat.ui.toolbar.item.Item.prototype.maybeSwitchEditMode = function() {
  // This function is only called if the item switches modes.
  goog.asserts.assert(this.getActiveEditModeName());

  // The action only changes modes if we are switching to a new mode.
  var action = /** @type {!audioCat.action.mode.ChangeEditModeAction} */(
      this.actionManager.retrieveAction(
          audioCat.action.ActionType.CHANGE_EDIT_MODE));
  action.setNextEditModeName(
      /** @type {audioCat.state.editMode.EditModeName} */(
          this.getActiveEditModeName()));
  action.doAction();
};

/**
 * Sets whether this item is visualized as clickable while active. This means
 * that the cursor is a pointer.
 * @param {boolean} clickableWhileActive Whether this item is to be indicated
 *     as clickable while active.
 * @protected
 */
audioCat.ui.toolbar.item.Item.prototype.setClickableOnActive =
    function(clickableWhileActive) {
  (clickableWhileActive ? goog.dom.classes.add : goog.dom.classes.remove)(
      this.getDom(), goog.getCssName('toolbarItemClickableWhileActive'));
};

/**
 * Sets the aria label of this item. Screen readers use the aria label.
 * @param {string} label The aria label to assign to the item's DOM element.
 */
audioCat.ui.toolbar.item.Item.prototype.setAriaLabel = function(label) {
  this.domHelper.setAriaLabel(this.getDom(), label);
};


/**
 * Static method for creating the internal DOM representation for an icon.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {string} url The relative URL of the icon from the final build
 *     directory.
 * @return {!Element} The internal DOM representation of the icon.
 */
audioCat.ui.toolbar.item.Item.createIcon = function(domHelper, url) {
  var image = domHelper.createElement('img');
  image.src = url;
  goog.dom.classes.add(image, goog.getCssName('toolbarItemIcon'));
  return image;
};


/**
 * Cleans up the item.
 * @override
 */
audioCat.ui.toolbar.item.Item.prototype.cleanUp = function() {
  // When the user hovers over the item, display description.  Hide on out.
  this.domHelper.unlistenForMouseOver(
      this.getDom(), this.handleMouseOver_, false, this);
  this.domHelper.unlistenForMouseOut(
      this.getDom(), this.handleMouseOut_, false, this);
  audioCat.ui.toolbar.item.Item.base(this, 'cleanUp');
};
