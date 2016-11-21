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
goog.provide('audioCat.ui.toolbar.item.SnapToGridItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.Events');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('audioCat.ui.visualization.events');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A toolbar item for switching between displaying audio with score or with
 * time units.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history. Executes undos and redos.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.SnapToGridItem = function(
    domHelper,
    commandManager,
    editModeManager,
    actionManager,
    toolTip) {
  /**
   * The edit mode in which the user can move sections around.
   * @private {!audioCat.state.editMode.SelectEditMode}
   */
  this.selectEditMode_ = /** @type {!audioCat.state.editMode.SelectEditMode} */(
      editModeManager.getEditModeByName(
          audioCat.state.editMode.EditModeName.SELECT));

  /**
   * The label.
   * @private {string}
   */
  this.label_ = this.determineAriaLabel_(editModeManager);

  goog.base(this, domHelper, editModeManager, actionManager, toolTip,
      this.label_, undefined, true,
      'Snap to grid. When this is on, ' +
          'sections of audio will snap to the grid when being moved.');

  // Only activate this item when we are in select mode. Otherwise, deactivate.
  goog.events.listen(editModeManager,
      audioCat.state.editMode.Events.EDIT_MODE_CHANGED,
      this.handleEditModeChange_, false, this);
  this.activateOrDeactivateBasedOnEditMode_(editModeManager);

  // Indicate to users that this item is clickable even when active.
  this.setClickableOnActive(true);
};
goog.inherits(
    audioCat.ui.toolbar.item.SnapToGridItem, audioCat.ui.toolbar.item.Item);

/**
 * Handles what happens when the edit mode changes. Specifically, activate or
 * deactivate this item based on whether we're in the right edit mode.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.handleEditModeChange_ =
    function(event) {
  this.activateOrDeactivateBasedOnEditMode_(
      /** @type {!audioCat.state.editMode.EditModeManager} */ (event.target));
};

/**
 * Activates or deactivates this item based on whether we are in the select edit
 * mode. We should not let the user snap the grid in other modes since that is
 * confusing.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages
 *     edit modes.
 * @private
 */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.
    activateOrDeactivateBasedOnEditMode_ = function(editModeManager) {
  // NOTE(chizeng): lol, this looks wrong. What is edit mode coding doing here?
  var inSelectEditMode = editModeManager.getCurrentEditMode().getName() ==
      audioCat.state.editMode.EditModeName.SELECT;
  if (inSelectEditMode) {
    // Clicking on this item should only do something when the item's enabled.
    this.domHelper.listenForPress(
        this.getDom(), this.handlePress_, false, this);
  } else {
    this.domHelper.unlistenForPress(
        this.getDom(), this.handlePress_, false, this);
  }
  this.setVisualizeEnabledState(inSelectEditMode);

  // Remember the label in the subclass to compute the description.
  this.label_ = this.determineAriaLabel_(editModeManager);
  this.setAriaLabel(this.label_);
};

/**
 * Handles what happens when you click on this button. Specifically, toggles
 * whether we snap to grid when the user moves sections around.
 * @private
 */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.handlePress_ = function() {
  /** @type {!audioCat.action.track.SnapToGridAction} */ (
      this.actionManager.retrieveAction(
          audioCat.action.ActionType.SNAP_TO_GRID)).doAction();
  this.visualizeSnapToGridState_();

  // Remember the label in the subclass to compute the description.
  this.label_ = this.determineAriaLabel_(this.editModeManager);
  this.setAriaLabel(this.label_);
};

/**
 * Visualizes whether we should highlight this item (because we are in a snap to
 * grid state).
 * @private
 */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.visualizeSnapToGridState_ =
    function() {
  this.setActiveState(this.selectEditMode_.getSnapToGridState());
};

/**
 * Computes the currently appropriate aria label.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages
 *     edit modes.
 * @return {string} The proper aria label for the current time.
 * @private
 */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.determineAriaLabel_ =
    function(editModeManager) {
  var label = 'snap to grid';
  if (this.selectEditMode_.getSnapToGridState()) {
    label = 'Turn off ' + label + '.';
  }
  if (editModeManager.getCurrentEditMode().getName() !=
      audioCat.state.editMode.EditModeName.SELECT) {
    label = 'Disabled ' + label + ' button.';
  }
  return label;
};

/** @override */
audioCat.ui.toolbar.item.SnapToGridItem.prototype.getInternalDom = function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/snapToGrid.svg');
};
