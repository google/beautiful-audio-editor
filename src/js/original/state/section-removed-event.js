goog.provide('audioCat.state.SectionRemovedEvent');

goog.require('audioCat.state.events');
goog.require('audioCat.utility.Event');


/**
 * Dispatched when a section is removed from a track.
 * @param {number} sectionIndex The index of the section that was removed.
 * @param {!audioCat.state.Section} section The section of audio removed.
 * @param {boolean=} opt_transitory If true, indicates that this section removal
 *     is part of a larger action. For instance, perhaps we're splitting a
 *     section, in which case we remove the previous section and add two new
 *     sections. Setting this parameter to true gives respondent objects the
 *     opportunity to delay manifesting changes until the last action instead of
 *     on this action.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.SectionRemovedEvent = function(
    sectionIndex,
    section,
    opt_transitory) {
  goog.base(this, audioCat.state.events.SECTION_REMOVED);

  /**
   * The index of the section that had just been removed.
   * @private {number}
   */
  this.sectionIndex_ = sectionIndex;

  /**
   * The removed section.
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * Whether this action is transitory - part of a larger action - as documented
   * above.
   * @private {boolean}
   */
  this.transitory_ = opt_transitory || false;
};
goog.inherits(audioCat.state.SectionRemovedEvent, audioCat.utility.Event);

/**
 * @return {!audioCat.state.Section} The section removed.
 */
audioCat.state.SectionRemovedEvent.prototype.getSection = function() {
  return this.section_;
};

/**
 * @return {number} The index of the section that was just removed.
 */
audioCat.state.SectionRemovedEvent.prototype.getSectionIndex = function() {
  return this.sectionIndex_;
};

/**
 * @return {boolean} Whether this action is transitory and thus part of a
 *     larger action as documented above.
 */
audioCat.state.SectionRemovedEvent.prototype.isTransitory = function() {
  return this.transitory_;
};
