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
goog.provide('audioCat.ui.toolbar.item.SaveToServiceItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.service.EventType');
goog.require('audioCat.ui.toolbar.item.Item');
goog.require('audioCat.ui.toolbar.item.Item.createIcon');
goog.require('goog.events');


/**
 * A toolbar item for saving to a service that we integrate with.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.service.Service} service Integrates with some other
 *     service.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 * @extends {audioCat.ui.toolbar.item.Item}
 */
audioCat.ui.toolbar.item.SaveToServiceItem = function(
    domHelper,
    service,
    editModeManager,
    actionManager,
    toolTip) {
  /**
   * The service to save to.
   * @private {!audioCat.service.Service}
   */
  this.service_ = service;
  var label = 'Save project to ' + service.getServiceName() + '.';
  audioCat.ui.toolbar.item.SaveToServiceItem.base(
      this, 'constructor', domHelper, editModeManager, actionManager, toolTip,
      label, undefined, undefined, label);

  this.activateOrDeactivate_();

  /**
   * A list of keys of events to possibly clean up later.
   * @private {!Array.<goog.events.Key>}
   */
  this.listenKeys_ = [
      goog.events.listen(service,
          audioCat.service.EventType.SHOULD_SAVE_STATE_CHANGED,
          this.activateOrDeactivate_, false, this)
    ];
};
goog.inherits(
    audioCat.ui.toolbar.item.SaveToServiceItem, audioCat.ui.toolbar.item.Item);

/**
 * Activates the button.
 * @private
 */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.activate_ = function() {
  this.domHelper.listenForUpPress(
      this.getDom(), this.handleUpPress_, false, this);
  this.setVisualizeEnabledState(true);
};

/**
 * De-activates the item.
 * @private
 */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.deActivate_ = function() {
  this.domHelper.unlistenForUpPress(
      this.getDom(), this.handleUpPress_, false, this);
  this.setVisualizeEnabledState(false);
};

/**
 * Handles what happens when the command history changes.
 * @private
 */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.activateOrDeactivate_ =
    function() {
  if (this.service_.getSaveNeeded()) {
    this.activate_();
  } else {
    this.deActivate_();
  }
};

/**
 * Executes an undo.
 * @private
 */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.handleUpPress_ =
    function() {
  var action = /** @type {!audioCat.action.service.SaveToServiceAction} */ (
      this.actionManager.retrieveAction(
          audioCat.action.ActionType.SAVE_TO_SERVICE));

  // Save the current project to the service.
  action.doAction();
};

/** @override */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.getInternalDom =
    function() {
  return audioCat.ui.toolbar.item.Item.createIcon(
      this.domHelper, 'images/' + this.service_.getSaveIconImage());
};

/** @override */
audioCat.ui.toolbar.item.SaveToServiceItem.prototype.cleanUp = function() {
  goog.base(this, 'cleanUp');
  for (var i = 0; i < this.listenKeys_.length; ++i) {
    goog.events.unlistenByKey(this.listenKeys_[i]);
  }
};
