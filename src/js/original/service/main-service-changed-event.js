goog.provide('audioCat.service.MainServiceChangedEvent');

goog.require('audioCat.service.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event indicating that the main service has changed. Maybe we just
 * integrated with Google Drive for instance.
 * @param {audioCat.service.Service} oldService The previous service. Or null if
 *     none.
 * @param {audioCat.service.Service} newService The new service. Or null if
 *     none.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.service.MainServiceChangedEvent = function(oldService, newService) {
  goog.base(this, audioCat.service.EventType.MAIN_SERVICE_CHANGED);
  /**
   * @type {audioCat.service.Service}
   */
  this.oldService = oldService;

  /**
   * @type {audioCat.service.Service}
   */
  this.newService = newService;
};
goog.inherits(audioCat.service.MainServiceChangedEvent, audioCat.utility.Event);
