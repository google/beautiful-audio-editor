goog.provide('audioCat.state.ProjectTitleChangedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * An event marking the change in the project title.
 * @param {boolean=} opt_stableChange Whether the change in project title is
 *     stable and thus indicates a long-term, not transient, change.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.ProjectTitleChangedEvent = function(opt_stableChange) {
  goog.base(this, audioCat.state.events.PROJECT_TITLE_CHANGED);
  /**
   * Whether the change is stable.
   * @type {boolean}
   */
  this.stable = !!opt_stableChange;
};
goog.inherits(audioCat.state.ProjectTitleChangedEvent, audioCat.utility.Event);
