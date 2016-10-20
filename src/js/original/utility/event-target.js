goog.provide('audioCat.utility.EventTarget');

goog.require('goog.events.EventTarget');


/**
 * An object that can dispatch events.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
audioCat.utility.EventTarget = function() {
  goog.base(this);
};
goog.inherits(audioCat.utility.EventTarget, goog.events.EventTarget);
