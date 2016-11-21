/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audioCat.ui.widget.field.GradientFieldSlider');

goog.require('audioCat.state.command.effect.FieldChangeCommand');
goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.ui.widget.SliderWidget');
goog.require('goog.events');


/**
 * A slider based off a given gradient field.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo / redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages the
 *     display of dialogs.
 * @param {!audioCat.state.effect.field.GradientField} gradientField A given
 *     gradient field.
 * @constructor
 * @extends {audioCat.ui.widget.SliderWidget}
 */
audioCat.ui.widget.field.GradientFieldSlider = function(
    idGenerator,
    domHelper,
    commandManager,
    dialogManager,
    gradientField) {
  var fieldName = gradientField.getName();
  var stableStateValue = gradientField.getValue();
  goog.base(this,
      domHelper,
      goog.getCssName('gradientFieldSlider'),
      gradientField.getUnit() + ' ' + fieldName.charAt(0).toUpperCase() +
          fieldName.slice(1),
      String(gradientField.getMin()),
      String(gradientField.getMax()),
      gradientField.getDecimalPlaces(), // Round this many places for display.
      1000000,
      gradientField.getMin(),
      gradientField.getMax(),
      stableStateValue, // The initial gain.
      gradientField.getDefaultValue(),
      dialogManager);

  // Respond to immediate changes in the slider.
  this.performAsSliderShifts(function(newStateValue) {
      gradientField.setValue(newStateValue);
    });

  // Respond to stable changes in the slider.
  this.performOnStableConfiguration(function(newStateValue) {
      commandManager.enqueueCommand(
          new audioCat.state.command.effect.FieldChangeCommand(
              gradientField,
              stableStateValue,
              newStateValue,
              idGenerator));
      stableStateValue = newStateValue;
    });

  // Respond to changes in the gradient field.
  /**
   * The key for the listener to changes from the gradient field.
   * @private {goog.events.Key}
   */
  this.gradientFieldChangeListenerKey_ = goog.events.listen(
      gradientField,
      audioCat.state.effect.field.EventType.FIELD_STABLE_VALUE_CHANGED,
      function() {
        stableStateValue = gradientField.getValue();
        this.setStateValue(stableStateValue);
      }, false, this);
};
goog.inherits(audioCat.ui.widget.field.GradientFieldSlider,
    audioCat.ui.widget.SliderWidget);

/** @override */
audioCat.ui.widget.field.GradientFieldSlider.prototype.cleanUp = function() {
  goog.base(this, 'cleanUp');
  goog.events.unlistenByKey(this.gradientFieldChangeListenerKey_);
};
