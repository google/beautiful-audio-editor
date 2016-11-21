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
goog.provide('audioCat.ui.toolbar.Toolbar');

goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Lets the user pick from a variety of items to say switch edit mode.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!Array.<!audioCat.ui.toolbar.item.Item>} items A list of items to
 *     include in the toolbar.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.toolbar.Toolbar = function(
    domHelper, editModeManager, items) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages the current edit mode.
   * @protected {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager = editModeManager;

  /**
   * Items to include in the toolbar.
   * @private {!Array.<!audioCat.ui.toolbar.item.Item>}
   */
  this.items_ = items;

  var editModeMapping = {};
  var numberOfItems = items.length;
  var container = domHelper.createElement('div');
  goog.base(this, container);
  goog.dom.classes.add(container, goog.getCssName('toolbarContainer'));

  // Find out which items to set to active during which active edit modes.
  // Also, append the item to the container of the toolbar.
  for (var i = 0; i < numberOfItems; ++i) {
    var item = items[i];
    domHelper.appendChild(container, item.getDom());
    var editModeNameForItem = item.getActiveEditModeName();
    if (editModeNameForItem) {
      editModeMapping[editModeNameForItem] = item;
    }
  }

  /**
   * Mapping between names of edit modes and items that switch into those modes.
   * Used for determining whether an item is active at the moment.
   * @protected {!Object.<!audioCat.state.editMode.EditModeName,
   *     !audioCat.ui.toolbar.item.Item>}
   */
  this.editModeMapping = editModeMapping;

  // Set the current edit mode's button if the button is in this toolbar.
  var currentItem =
      editModeMapping[editModeManager.getCurrentEditMode().getName()];
  if (currentItem) {
    currentItem.setActiveState(true);
  }

  goog.events.listen(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
          this.handleEditModeChange_, false, this);
};
goog.inherits(audioCat.ui.toolbar.Toolbar, audioCat.ui.widget.Widget);

/**
 * Handles changes in edit mode.
 * @param {!audioCat.state.editMode.EditModeChangedEvent} event The event
 *     dispatched when the current edit mode changes.
 * @private
 */
audioCat.ui.toolbar.Toolbar.prototype.handleEditModeChange_ = function(event) {
  var editModeMapping = this.editModeMapping;
  var oldItem = editModeMapping[event.getPreviousEditMode().getName()];
  var newItem = editModeMapping[event.getNewEditMode().getName()];
  if (oldItem) {
    oldItem.setActiveState(false);
  }
  if (newItem) {
    newItem.setActiveState(true);
  }
};

/**
 * Removes an item from the toolbar and its DOM. Does not clean it up.
 * @param {!audioCat.ui.toolbar.item.Item} item The item to remove.
 * @return {boolean} Whether an item was actually removed.
 */
audioCat.ui.toolbar.Toolbar.prototype.removeItem = function(item) {
  this.domHelper_.removeNode(item.getDom());
  var itemRemoved = goog.array.remove(this.items_, item);
  var editModeNameForItem = item.getActiveEditModeName();
  if (editModeNameForItem) {
    delete this.editModeMapping[editModeNameForItem];
  }
  return itemRemoved;
};

/**
 * Adds an item to the toolbar at a specified position.
 * @param {!audioCat.ui.toolbar.item.Item} item The item to add.
 * @param {number=} opt_index The index at which to add the item. Defaults to
 *     the end.
 */
audioCat.ui.toolbar.Toolbar.prototype.addItem = function(item, opt_index) {
  var index = goog.isDef(opt_index) ? opt_index : this.items_.length;
  var itemRemoved = goog.array.insertAt(this.items_, item, index);
  var editModeNameForItem = item.getActiveEditModeName();
  if (editModeNameForItem) {
    this.editModeMapping[editModeNameForItem] = item;
  }
  this.domHelper_.insertChildAt(this.getDom(), item.getDom(), index);
};


/** @override */
audioCat.ui.toolbar.Toolbar.prototype.cleanUp = function() {
  goog.events.unlisten(this.editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
          this.handleEditModeChange_, false, this);
  audioCat.ui.toolbar.Toolbar.base(this, 'cleanUp');
};
