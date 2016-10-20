goog.provide('audioCat.state.command.effect.FieldChangeCommand');

goog.require('audioCat.state.command.Command');


/**
 * Command that alters the value of a field.
 * @param {!audioCat.state.effect.field.GradientField} gradientField A given
 *     gradient field to change in value.
 * @param {number} previousValue The value before this command.
 * @param {number} newValue The value after this command.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.state.command.Command}
 */
audioCat.state.command.effect.FieldChangeCommand =
    function(gradientField, previousValue, newValue, idGenerator) {
  goog.base(this, idGenerator, true);

  /**
   * @private {!audioCat.state.effect.field.GradientField}
   */
  this.gradientField_ = gradientField;

  /**
   * The previous value of the field.
   * @private {number}
   */
  this.previousValue_ = previousValue;

  /**
   * The new value of the field.
   * @private {number}
   */
  this.newValue_ = newValue;
};
goog.inherits(audioCat.state.command.effect.FieldChangeCommand,
    audioCat.state.command.Command);

/** @override */
audioCat.state.command.effect.FieldChangeCommand.prototype.perform =
    function(project, trackManager) {
  this.gradientField_.setValue(this.newValue_, true);
};

/** @override */
audioCat.state.command.effect.FieldChangeCommand.prototype.undo =
    function(project, trackManager) {
  this.gradientField_.setValue(this.previousValue_, true);
};

/** @override */
audioCat.state.command.effect.FieldChangeCommand.prototype.getSummary =
    function(forward) {
  var gradientField = this.gradientField_;
  return 'Set ' + gradientField.getName() + (forward ? '' : ' back') +
      ' to ' + (forward ? this.newValue_ : this.previousValue_).
          toFixed(gradientField.getDecimalPlaces()) + '.';
};
