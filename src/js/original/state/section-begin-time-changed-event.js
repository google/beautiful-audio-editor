goog.provide('audioCat.state.SectionBeginTimeChangedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * The event thrown by a section when its begin time changes.
 * @param {number} previousBeginTime The previous begin time in seconds.
 * @param {number} newBeginTime The new begin time in seconds.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.SectionBeginTimeChangedEvent = function(
    previousBeginTime,
    newBeginTime) {
  goog.base(this, audioCat.state.events.SECTION_BEGIN_TIME_CHANGED);

  /**
   * @private {number}
   */
  this.previousBeginTime_ = previousBeginTime;

  /**
   * @private {number}
   */
  this.newBeginTime_ = newBeginTime;
};
goog.inherits(
    audioCat.state.SectionBeginTimeChangedEvent, audioCat.utility.Event);

/**
 * @return {number} The previous begin time in seconds.
 */
audioCat.state.SectionBeginTimeChangedEvent.prototype.getPreviousBeginTime =
    function() {
  return this.previousBeginTime_;
};

/**
 * @return {number} The new begin time in seconds.
 */
audioCat.state.SectionBeginTimeChangedEvent.prototype.getNewBeginTime =
    function() {
  return this.newBeginTime_;
};
