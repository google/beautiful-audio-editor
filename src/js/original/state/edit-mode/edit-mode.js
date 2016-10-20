goog.provide('audioCat.state.editMode.EditMode');

goog.require('audioCat.utility.EventTarget');


/**
 * An edit mode that the application can be in.
 * @param {!audioCat.state.editMode.EditModeName} name The name of the mode.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.editMode.EditMode = function(name) {
  goog.base(this);
  /**
   * The name of the mode.
   * @private {!audioCat.state.editMode.EditModeName}
   */
  this.name_ = name;
};
goog.inherits(audioCat.state.editMode.EditMode, audioCat.utility.EventTarget);

/**
 * @return {!audioCat.state.editMode.EditModeName} The name of the edit mode.
 */
audioCat.state.editMode.EditMode.prototype.getName = function() {
  return this.name_;
};
