goog.provide('audioCat.ui.menu.item.LoadLocalProjectItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for loading a project from a local file.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.LoadLocalProjectItem =
    function(domHelper, actionManager, statePlanManager) {
  goog.base(this, 'Load project from local .audioproject file.');

  // Respond to clicks.
  var action = actionManager.retrieveAction(
      audioCat.action.ActionType.LOAD_PROJECT_STATE);
  this.listen(goog.ui.Component.EventType.ACTION,
      action.doAction, false, action);
};
goog.inherits(
    audioCat.ui.menu.item.LoadLocalProjectItem, audioCat.ui.menu.item.MenuItem);
