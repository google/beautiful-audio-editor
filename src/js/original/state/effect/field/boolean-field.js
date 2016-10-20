goog.provide('audioCat.state.effect.field.BooleanField');

goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.state.effect.field.Field');
goog.require('audioCat.state.effect.field.FieldCategory');


/**
 * A field that takes on either true or false as values.
 * @param {string} name The name of the field.
 * @param {string} description A description of the field.
 * @param {boolean=} opt_initialValue The initial value. Defaults to false.
 * @constructor
 * @extends {audioCat.state.effect.field.Field}
 */
audioCat.state.effect.field.BooleanField = function(
    name,
    description,
    opt_initialValue) {
  goog.base(this,
      name,
      description,
      '',
      audioCat.state.effect.field.FieldCategory.DISCRETE);

  /**
   * The value of the field.
   * @private {boolean}
   */
  this.value_ = !!opt_initialValue;
};
goog.inherits(audioCat.state.effect.field.BooleanField,
    audioCat.state.effect.field.Field);

/**
 * Sets the value of the field.
 * @param {boolean} value The new value.
 */
audioCat.state.effect.field.BooleanField.prototype.setValue = function(
    value) {
  if (this.value_ != value) {
    this.value_ = value;
    this.dispatchEvent(
        audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED);
  }
};

/**
 * @return {boolean} The value of the field.
 */
audioCat.state.effect.field.BooleanField.prototype.getValue = function() {
  return this.value_;
};
