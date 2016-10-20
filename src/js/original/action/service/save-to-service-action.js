goog.provide('audioCat.action.service.SaveToServiceAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('goog.asserts');


/**
 * Saves a project to the current primary service in use. Assumes that the
 * service exists.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages services to
 *     integrate with.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.service.SaveToServiceAction = function(
    domHelper,
    serviceManager,
    dialogManager) {

  /**
   * Manages DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * Integrates with outside services like Google Drive.
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  goog.base(this);
};
goog.inherits(
    audioCat.action.service.SaveToServiceAction, audioCat.action.Action);

/** @override */
audioCat.action.service.SaveToServiceAction.prototype.doAction = function() {
  var service = this.serviceManager_.getPrimaryService();
  // This action assumes an existing primary service we integrated with.
  goog.asserts.assert(service);
  service.saveContent();
};
