goog.provide('audioCat.state.effect.field.Field');

goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.utility.EventTarget');


/**
 * A field that is a property of an effect. Such as gain or Q.
 * @param {string} name The name of the field.
 * @param {string} description The description of the field.
 * @param {string} units The string for labelling units for this field, ie dB
 *     or s. Could be an empty string.
 * @param {audioCat.state.effect.field.FieldCategory} fieldCategory The category
 *     of the field. Gradient? Discrete?
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.effect.field.Field = function(
      name, description, units, fieldCategory) {
  goog.base(this);

  /**
   * The name of the field.
   * @private {string}
   */
  this.name_ = name;

  /**
   * The description of the field.
   * @private {string}
   */
  this.description_ = description;

  /**
   * The units for this field.
   * @private {string}
   */
  this.units_ = units;

  /**
   * The category of the field.
   * @private {audioCat.state.effect.field.FieldCategory}
   */
  this.fieldCategory_ = fieldCategory;

  /**
   * Whether this field is active. Sometimes, fields could be inactive if a
   * filter has no use for it. For instance, a lowpass filter has no use for a
   * gain field, but has it anyway since all filter effects have that field.
   * @private {boolean}
   */
  this.activeState_ = true;
};
goog.inherits(audioCat.state.effect.field.Field, audioCat.utility.EventTarget);

/**
 * @return {string} The name of the field.
 */
audioCat.state.effect.field.Field.prototype.getName = function() {
  return this.name_;
};

/**
 * @return {string} The description of the field.
 */
audioCat.state.effect.field.Field.prototype.getDescription = function() {
  return this.description_;
};

/**
 * Sets the description of the field.
 * @param {string} description The new description.
 */
audioCat.state.effect.field.Field.prototype.setDescription = function(
    description) {
  this.description_ = description;
  this.dispatchEvent(
      audioCat.state.effect.field.EventType.FIELD_DESCRIPTION_CHANGED);
};

/**
 * @return {string} The unit used to describe the value of the field.
 */
audioCat.state.effect.field.Field.prototype.getUnit = function() {
  return this.units_;
};

/**
 * @return {audioCat.state.effect.field.FieldCategory} The category of the
 *     field. Is it discrete? Is it a continuous real number (gradient)?
 */
audioCat.state.effect.field.Field.prototype.getCategory = function() {
  return this.fieldCategory_;
};

/**
 * @return {boolean} Whether this field is active.
 */
audioCat.state.effect.field.Field.prototype.getActiveState = function() {
  return this.activeState_;
};

/**
 * Sets whether this field is active.
 * @param {boolean} activeState Whether this state will be active.
 */
audioCat.state.effect.field.Field.prototype.setActiveState = function(
    activeState) {
  this.activeState_ = activeState;
};
