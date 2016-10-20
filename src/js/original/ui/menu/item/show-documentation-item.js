goog.provide('audioCat.ui.menu.item.ShowDocumentationItem');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.command.Event');
goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.events');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for showing documentation for the editor.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.ShowDocumentationItem =
    function(domHelper, actionManager) {
  goog.base(this, 'Open help docs in new window.');

  /**
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  // Handle clicks.
  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(audioCat.ui.menu.item.ShowDocumentationItem,
    audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.ShowDocumentationItem.prototype.handleClick_ =
    function() {
  var action = /** @type {!audioCat.action.ShowDocumentationAction} */ (
      this.actionManager_.retrieveAction(
          audioCat.action.ActionType.SHOW_DOCUMENTATION));
  action.doAction();
};

