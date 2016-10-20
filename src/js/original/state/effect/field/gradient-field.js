goog.provide('audioCat.state.effect.field.GradientField');

goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.state.effect.field.Field');
goog.require('audioCat.state.effect.field.FieldCategory');


/**
 * A generic field for a value that is continuous and thus takes values along a
 * gradient of values.
 * @param {string} name The name of the field.
 * @param {string} description The description of the field.
 * @param {string} units The string for labelling units for this field, ie dB
 *     or s. Could be an empty string.
 * @param {number} min The min value.
 * @param {number} max The max value.
 * @param {number} decimalPlaces How many decimal places to round values to for
 *     display.
 * @param {number} defaultValue The default value.
 * @param {number=} opt_initialValue The optional initial value if different
 *     from the default value.
 * @constructor
 * @extends {audioCat.state.effect.field.Field}
 */
audioCat.state.effect.field.GradientField = function(
    name,
    description,
    units,
    min,
    max,
    decimalPlaces,
    defaultValue,
    opt_initialValue) {
  goog.base(this, name, description, units,
      audioCat.state.effect.field.FieldCategory.GRADIENT);

  /**
   * The number of decimal places to round values to for display.
   * @private {number}
   */
  this.decimalPlaces_ = decimalPlaces;

  /**
   * The min value for the field. Not enforced by this class.
   * @private {number}
   */
  this.min_ = min;

  /**
   * The max value for the field. Not enforced by this class.
   * @private {number}
   */
  this.max_ = max;

  /**
   * The default value.
   * @private {number}
   */
  this.defaultValue_ = defaultValue;

  /**
   * The value for the field.
   * @private {number}
   */
  this.value_ = goog.isDef(opt_initialValue) ? opt_initialValue : defaultValue;
};
goog.inherits(audioCat.state.effect.field.GradientField,
    audioCat.state.effect.field.Field);

/**
 * @return {number} The number of decimal places to round values to for display.
 */
audioCat.state.effect.field.GradientField.prototype.getDecimalPlaces =
    function() {
  return this.decimalPlaces_;
};

/**
 * @return {number} The minimum value allowed.
 */
audioCat.state.effect.field.GradientField.prototype.getMin = function() {
  return this.min_;
};

/**
 * @return {number} The maximum value allowed.
 */
audioCat.state.effect.field.GradientField.prototype.getMax = function() {
  return this.max_;
};

/**
 * @return {number} The default value of the field.
 */
audioCat.state.effect.field.GradientField.prototype.getDefaultValue =
    function() {
  return this.defaultValue_;
};

/**
 * @return {number} The value of the field.
 */
audioCat.state.effect.field.GradientField.prototype.getValue = function() {
  return this.value_;
};

/**
 * Sets the value of the field.
 * @param {number} value The new value of the field.
 * @param {boolean=} opt_stableChange Whether this change is a change in the
 *     stable value of the field. Defaults to false.
 */
audioCat.state.effect.field.GradientField.prototype.setValue = function(
    value, opt_stableChange) {
  this.value_ = value;
  this.dispatchEvent(audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED);
  if (opt_stableChange) {
    this.dispatchEvent(
        audioCat.state.effect.field.EventType.FIELD_STABLE_VALUE_CHANGED);
  }
};
