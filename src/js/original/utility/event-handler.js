goog.provide('audioCat.utility.EventHandler');

goog.require('goog.events.EventHandler');


/**
 * Coordinates event listeners so they can be later easily removed en mass.
 * @param {!Object=} opt_scope Object in whose scope to call the listeners.
 * @constructor
 * @extends {goog.events.EventHandler}
 */
audioCat.utility.EventHandler = function(opt_scope) {
  goog.base(this, opt_scope);
};
goog.inherits(audioCat.utility.EventHandler, goog.events.EventHandler);
