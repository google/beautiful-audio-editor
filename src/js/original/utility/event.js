goog.provide('audioCat.utility.Event');

goog.require('goog.events.Event');


/**
 * An event that can be dispatched by an event target.
 * @param {string} type_name The name of the event.
 * @param {!audioCat.utility.EventTarget=} opt_target The event target.
 * @constructor
 * @extends {goog.events.Event}
 */
audioCat.utility.Event = function(type_name, opt_target) {
  goog.base(this, type_name, opt_target);
};
goog.inherits(audioCat.utility.Event, goog.events.Event);
