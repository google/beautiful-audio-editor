goog.provide('audioCat.ui.envelope.ControlPointDownPressEvent');

goog.require('audioCat.ui.envelope.events');
goog.require('audioCat.utility.Event');


/**
 * Event fired by control point dragger upon down press.
 * @param {number} clientX The clientX value upon down press.
 * @param {number} clientY The clientY value upon down press.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.ui.envelope.ControlPointDownPressEvent = function(clientX, clientY) {
  goog.base(this, audioCat.ui.envelope.events.CONTROL_POINT_DOWN_PRESS);

  /**
   * The clientX value upon down press.
   * @public {number}
   */
  this.clientX = clientX;

  /**
   * The clientY value upon down press.
   * @public {number}
   */
  this.clientY = clientY;
};
goog.inherits(audioCat.ui.envelope.ControlPointDownPressEvent,
    audioCat.utility.Event);
