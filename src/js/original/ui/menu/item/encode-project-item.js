goog.provide('audioCat.ui.menu.item.EncodeProjectItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for encoding the project for storing locally.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.StatePlanManager} statePlanManager Encodes and
 *     decodes the state of the project.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.EncodeProjectItem =
    function(domHelper, actionManager, statePlanManager) {
  goog.base(this, 'Save project to local file for later load.');

  // Enable / disable this item based on whether we are saving a file.
  statePlanManager.listen(audioCat.state.events.ENCODING_BEGAN,
      goog.partial(this.setEnabled, false), false, this);
  statePlanManager.listen(audioCat.state.events.ENCODING_DONE,
      goog.partial(this.setEnabled, true), false, this);

  // Respond to clicks.
  var action = actionManager.retrieveAction(
      audioCat.action.ActionType.ENCODE_PROJECT);
  this.listen(goog.ui.Component.EventType.ACTION,
      action.doAction, false, action);
};
goog.inherits(
    audioCat.ui.menu.item.EncodeProjectItem, audioCat.ui.menu.item.MenuItem);
