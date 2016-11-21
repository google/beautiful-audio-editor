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
goog.provide('audioCat.ui.toolbar.ToolbarManager');

goog.require('audioCat.service.EventType');
goog.require('goog.array');


/**
 * Manages toolbars.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!Element} container The container for all toolbars.
 * @param {!audioCat.state.editMode.EditModeManager} editModeManager Manages the
 *     current edit mode.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages services
 *     that integrate with this editor.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions that
 *     can be performed here and there.
 * @param {!Array.<!audioCat.ui.toolbar.Toolbar>} toolbars A list of toolbars to
 *     be included.
 * @param {!Function} headerOffsetFunction The method called to set the height
 *     of the header. This function is needed since an empty toolbar differs in
 *     height from a toolbar with items.
 * @param {!audioCat.ui.tooltip.ToolTip} toolTip Displays tips sometimes after
 *     user hovers over something.
 * @constructor
 */
audioCat.ui.toolbar.ToolbarManager = function(
    domHelper,
    container,
    editModeManager,
    serviceManager,
    actionManager,
    toolbars,
    headerOffsetFunction,
    toolTip) {
  /**
   * Facilitates DOM interactions
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The container for all toolbars.
   * @private {!Element}
   */
  this.container_ = container;

  /**
   * Manages the current edit mode.
   * @private {!audioCat.state.editMode.EditModeManager}
   */
  this.editModeManager_ = editModeManager;

  /**
   * Manages actions to be run here and there.
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  /**
   * A list of toolbars to include.
   * @private {!Array.<!audioCat.ui.toolbar.Toolbar>}
   */
  this.toolbars_ = toolbars;

  /**
   * A method that changes the header offset and thus how far the ruler is from
   * the top of the page.
   * @private {!Function}
   */
  this.headerOffsetFunction_ = headerOffsetFunction;

  /**
   * Tooltip that displays sometimes when the user hovers over stuff.
   * @private {!audioCat.ui.tooltip.ToolTip}
   */
  this.toolTip_ = toolTip;

  /**
   * The current service toolbar if any. Null if none.
   * @private {audioCat.ui.toolbar.ServiceToolbar}
   */
  this.serviceToolbar_ = null;

  if (serviceManager.getPrimaryService()) {
    this.addServiceToolbar_(serviceManager);
  }
  serviceManager.listen(audioCat.service.EventType.MAIN_SERVICE_CHANGED,
      this.handleChangeInService_, false, this);
};

/**
 * Renders all toolbars into the container.
 */
audioCat.ui.toolbar.ToolbarManager.prototype.render = function() {
  var toolbars = this.toolbars_;
  var numberOfToolbars = toolbars.length;
  var domHelper = this.domHelper_;
  var container = this.container_;
  for (var i = 0; i < numberOfToolbars; ++i) {
    domHelper.appendChild(container, toolbars[i].getDom());
  }
};

/**
 * Handles what happens when the service changes.
 * @param {!audioCat.service.MainServiceChangedEvent} event The associated
 *     event.
 * @private
 */
audioCat.ui.toolbar.ToolbarManager.prototype.handleChangeInService_ =
    function(event) {
  if (this.serviceToolbar_) {
    goog.array.remove(this.toolbars_, this.serviceToolbar_);
    this.serviceToolbar_.cleanUp(); // todo: actually clean up.
    this.domHelper_.removeNode(this.serviceToolbar_.getDom());
    this.serviceToolbar_ = null;
  }
  if (event.newService) {
    this.addServiceToolbar_(/** @type {!audioCat.service.ServiceManager} */ (
        event.target));
  }
};

/**
 * Creates and adds a service toolbar assuming that a current primary service
 * exists.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages integration
 *     with other services such as Google Drive.
 * @private
 */
audioCat.ui.toolbar.ToolbarManager.prototype.addServiceToolbar_ = function(
    serviceManager) {
  this.serviceToolbar_ = new audioCat.ui.toolbar.ServiceToolbar(
      serviceManager,
      this.domHelper_,
      this.editModeManager_,
      this.actionManager_,
      this.headerOffsetFunction_,
      this.toolTip_);
  this.toolbars_.push(this.serviceToolbar_);
  this.domHelper_.appendChild(this.container_, this.serviceToolbar_.getDom());
  // Push the ruler down far enough - adding a new toolbar could temporarily
  // change the height of the toolbar container.
  this.headerOffsetFunction_();
};
