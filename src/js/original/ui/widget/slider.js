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
goog.provide('audioCat.ui.widget.SliderWidget');

goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('audioCat.ui.widget.templates');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.string');
goog.require('soy');


/**
 * A generic, abstract slider.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {string} className The class name to give to the container of the
 *     slider widget as a whole.
 * @param {string} sliderMainLabel The main label to give the slider for the
 *     user to see.
 * @param {string} leftLabel The label to the left of the slider.
 * @param {string} rightLabel The label to the right of the slider.
 * @param {number} decimalRound The number of decimal points to round values to
 *     for display.
 * @param {number} divisions The number of stopping points on the slider. The
 *     more stopping points, the finer the slider resolution.
 * @param {number} minStateValue The min value of the state the slider is
 *     representing. For gain, this would be 0.
 * @param {number} maxStateValue The max value of the state the slider is
 *     representing. For gain, this would be 1.0.
 * @param {number} initialStateValue The initial state value the slider will
 *     take on. The slider will round to the closest stop on it.
 * @param {number} defaultStateValue The default state value. When the user
 *     hits reset, the slider will be set to this state value.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.SliderWidget = function(
    domHelper,
    className,
    sliderMainLabel,
    leftLabel,
    rightLabel,
    decimalRound,
    divisions,
    minStateValue,
    maxStateValue,
    initialStateValue,
    defaultStateValue,
    dialogManager) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The main label for the slider.
   * @private {string}
   */
  this.mainLabel_ = sliderMainLabel;

  /**
   * The number of stops on the slider.
   * @private {number}
   */
  this.numberOfStops_ = divisions;

  /**
   * The min DOM value of the slider
   * @private {number}
   */
  this.minSliderValue_ = 1;

  /**
   * The max DOM value of the slider.
   * @private {number}
   */
  this.maxSliderValue_ = divisions + this.minSliderValue_ - 1;
  // Above, we must subtract 1 to discount the min value as a single stop.

  /**
   * The minimum state value.
   * @private {number}
   */
  this.minStateValue_ = minStateValue;

  /**
   * The maximum state value.
   * @private {number}
   */
  this.maxStateValue_ = maxStateValue;

  /**
   * The difference in state value.
   * @private {number}
   */
  this.stateDifference_ = maxStateValue - minStateValue;

  /**
   * The initial state value.
   * @private {number}
   */
  this.initialStateValue_ = initialStateValue;

  /**
   * The default state value.
   * @private {number}
   */
  this.defaultStateValue_ = defaultStateValue;

  /**
   * Manages dialogs.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * The number of places to round decimal points to for display.
   * @private {number}
   */
  this.decimalRound_ = decimalRound;

  /**
   * The lower bound of the range [-small value, 0] in which the display value
   * will dangerously display a negative 0 value, ie something like -0.00.
   * @private {number}
   */
  this.negativeZeroBound_ = -1 * Math.pow(10, -1 * decimalRound);
  var initialSliderValue = this.computeSliderValue_(this.initialStateValue_);

  // The DOM element for container of the slider.
  var element = /** @type {!Element} */ (
      soy.renderAsFragment(audioCat.ui.widget.templates.SliderWidget, {
        mainLabel: sliderMainLabel,
        leftLabel: leftLabel,
        rightLabel: rightLabel,
        initialStateValue: initialStateValue,
        initialSliderValue: initialSliderValue,
        minSliderValue: this.minSliderValue_,
        maxSliderValue: this.maxSliderValue_
      }));
  goog.dom.classes.add(element, className);
  goog.base(this, element);

  /**
   * The slider element.
   * @private {!Element}
   */
  this.sliderElement_ = domHelper.getElementByClassForSure(
      goog.getCssName('sliderInputElement'), element);

  /**
   * The container for the value label.
   * @private {!Element}
   */
  this.sliderLabelContainer_ = domHelper.getElementByClassForSure(
      goog.getCssName('sliderValueContainer'), element);
  this.setValueDisplayer_(initialStateValue);

  /**
   * The stable slider DOM value.
   * @private {number}
   */
  this.stableSliderDomValue_ = initialSliderValue;

  /**
   * The function to call when the slider changes, not necessarily stabily. The
   * new state value will be given to the callback.
   * @private {!Function}
   */
  this.genericChangeCallback_ = goog.nullFunction;

  /**
   * The function to call when the slider changes stabily. The new stable state
   * value will be given to the callback.
   * @private {!Function}
   */
  this.stableChangeCallback_ = goog.nullFunction;

  var sliderElement = this.sliderElement_;
  goog.events.listen(
      sliderElement, 'change', this.handleSliderValueChange_, false, this);
  goog.events.listen(
      sliderElement, 'input', this.handleSliderValueChange_, false, this);

  domHelper.listenForUpPress(sliderElement,
      this.handleSliderStableValueChange_, false, this);

  // TODO(chizeng): Clean up this listener if this widget ever goes away.
  // Open a dialog letting the user alter the value upon clicking.
  domHelper.listenForUpPress(this.sliderLabelContainer_,
      this.handleSliderLabelContainerClicked_, false, this);
};
goog.inherits(audioCat.ui.widget.SliderWidget, audioCat.ui.widget.Widget);

/**
 * Handles what happens when the user clicks on the value displayer.
 * Specifically, lets the user manually input a value.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.handleSliderLabelContainerClicked_ =
    function() {
  var dialogManager = this.dialogManager_;
  var domHelper = this.domHelper_;
  var content = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.widget.templates.SliderWidgetValueDialog, {
        mainLabel: this.mainLabel_,
        minStateValue: this.minStateValue_,
        maxStateValue: this.maxStateValue_,
        currentStateValue:
            this.obtainValueDisplayerString_(this.getCurrentStateValue())
      }
    ));

  var inputElement = domHelper.getElementByClassForSure(
      goog.getCssName('sliderDialogInputElement'), content);

  // Updates the stable value of the slider. Returns 0 if successful. Otherwise,
  // returns display string.
  var updateValue = function(opt_stateValue) {
    var stateValue = goog.isDef(opt_stateValue) ?
        opt_stateValue : goog.string.toNumber(inputElement.value.trim());
    if (isNaN(stateValue)) {
      return 'Invalid value.';
    }
    if (stateValue < this.minStateValue_ || stateValue > this.maxStateValue_) {
      // Value is out of range.
      return 'Value is out of range.';
    }

    var sliderValue = this.computeSliderValue_(stateValue);
    stateValue = this.computeStateValue_(sliderValue);
    // Update the slider.
    this.sliderElement_.value = sliderValue;

    // Make updates.
    this.handleSliderValueChange_();
    this.handleSliderStableValueChange_();

    // Display the rounded value for consistency.
    inputElement.value = this.obtainValueDisplayerString_(stateValue);

    return 0;
  };

  var messageBoxContainer = domHelper.getElementByClassForSure(
      goog.getCssName('messageBoxContainer'), content);
  var warningBox = domHelper.getElementByClassForSure(
      goog.getCssName('warningBox'), content);
  var successBox = domHelper.getElementByClassForSure(
      goog.getCssName('successBox'), content);
  domHelper.removeNode(warningBox);
  domHelper.removeNode(successBox);

  // Apply a value. Return true on success.
  var applyValue = function(e, opt_value) {
    var error = goog.bind(updateValue, this)(opt_value);
    if (error) {
      domHelper.setRawInnerHtml(warningBox, error);
      domHelper.appendChild(messageBoxContainer, warningBox);
      domHelper.removeNode(successBox);
      return false;
    }
    domHelper.removeNode(warningBox);
    domHelper.setRawInnerHtml(successBox, 'Value applied successfully.');
    domHelper.appendChild(messageBoxContainer, successBox);
    return true;
  };

  // The applyValue function bound to the correct execution context.
  var boundApply = goog.bind(applyValue, this);

  // Obtain a cancelable dialog.
  var dialog = dialogManager.obtainDialog(
      content, audioCat.ui.dialog.DialogText.CLOSE);

  // The OK button applies the value, then closes the dialog if all is well.
  var formSubmitListenerKey;
  var dialogCancelListenerKey;
  var handleOk = function(e) {
    // Prevent the form from actually submitting and refreshing the page.
    e.preventDefault();
    if (boundApply(e, undefined)) {
      dialogManager.hideDialog(dialog);

      // Stop listening to the form.
      goog.events.unlistenByKey(formSubmitListenerKey);

      // Stop listening to the cancel event.
      goog.events.unlistenByKey(dialogCancelListenerKey);
    }

    // Return false to help suppress browsers from submitting the form and
    // refreshing the page.
    return false;
  };

  // Create the primary dialog buttons.
  var buttonsArea = domHelper.createElement('div');
  goog.dom.classes.add(buttonsArea, goog.getCssName('sliderButtonsArea'));

  var applyButton = dialogManager.obtainButton('Apply');
  applyButton.performOnUpPress(boundApply);
  domHelper.appendChild(buttonsArea, applyButton.getDom());

  var okButton = dialogManager.obtainButton('OK');
  var boundOkCallback = goog.bind(handleOk, this);
  okButton.performOnUpPress(boundOkCallback);
  domHelper.appendChild(buttonsArea, okButton.getDom());

  var resetButton = dialogManager.obtainButton('Reset to ' +
      this.obtainValueDisplayerString_(this.defaultStateValue_));
  resetButton.performOnUpPress(
      goog.bind(applyValue, this, undefined, this.defaultStateValue_));
  domHelper.appendChild(buttonsArea, resetButton.getDom());

  // Put the buttons onto the main content panel.
  domHelper.appendChild(content, buttonsArea);

  // The user could've submitted the form by hitting enter instead of clicking
  // OK.
  var sliderDialogForm = domHelper.getElementByClassForSure(
      goog.getCssName('sliderDialogForm'), content);
  formSubmitListenerKey = goog.events.listen(sliderDialogForm, 'submit',
      boundOkCallback, false, this);

  dialogCancelListenerKey = goog.events.listenOnce(
      dialog, audioCat.ui.dialog.EventType.HIDE_DIALOG_REQUESTED,
      function() {
        // Stop listening to the form.
        goog.events.unlistenByKey(formSubmitListenerKey);
      }, false, this);

  // Show the dialog.
  dialogManager.showDialog(dialog);
};

/**
 * @return {number} The current state value.
 */
audioCat.ui.widget.SliderWidget.prototype.getCurrentStateValue = function() {
  return this.computeStateValue_(this.sliderElement_.value);
};

/**
 * Sets the string that the value displayer shows.
 * @param {number} stateValue The state value.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.setValueDisplayer_ =
    function(stateValue) {
  this.domHelper_.setTextContent(
      this.sliderLabelContainer_,
      this.obtainValueDisplayerString_(stateValue));
};

/**
 * Obtains the string that the value displayer should show.
 * @param {number} stateValue The state value to show.
 * @return {string} A string representation of the state value that is
 *     presentable to the user.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.obtainValueDisplayerString_ =
    function(stateValue) {
  if (stateValue > this.negativeZeroBound_ && stateValue < 0) {
    // Prevent displays of negative 0 values, ie something like -0.00.
    stateValue = 0;
  }
  return stateValue.toFixed(this.decimalRound_);
};

/**
 * Handles changes in slider value.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.handleSliderValueChange_ =
    function() {
  var newStateValue = this.getCurrentStateValue();
  this.setValueDisplayer_(newStateValue);
  this.genericChangeCallback_(newStateValue);
};

/**
 * Performs a certain function when the slider changes as the user actively
 * drags it. The given function takes the state value as parameter.
 * @param {!Function}
 *     callback A method to call with the slider as the context when the user
 *     drags the slider.
 */
audioCat.ui.widget.SliderWidget.prototype.performAsSliderShifts =
    function(callback) {
  this.genericChangeCallback_ = callback;
};

/**
 * Performs a certain function when the slider enters a new stable position.
 * @param {!Function}
 *     callback A method to call with the slider as the context when the user
 *     drags the slider. The given function takes the state value as parameter.
 */
audioCat.ui.widget.SliderWidget.prototype.performOnStableConfiguration =
    function(callback) {
  this.stableChangeCallback_ = callback;
};

/**
 * Handles changes in the stable value of the slider.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.handleSliderStableValueChange_ =
    function() {
  var sliderValue = this.sliderElement_.value;
  if (this.stableSliderDomValue_ != sliderValue) {
    // Only change the slider value if there is an actual change.
    this.stableSliderDomValue_ = sliderValue;
    this.stableChangeCallback_(this.computeStateValue_(sliderValue));
  }
};

/**
 * Computes the state value from the slider DOM value.
 * @param {number} sliderValue Slider DOM value.
 * @return {number} The corresponding state value.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.computeStateValue_ =
    function(sliderValue) {
  var minSliderValue = this.minSliderValue_;
  return this.minStateValue_ +
      (sliderValue - minSliderValue) * this.stateDifference_ /
          (this.maxSliderValue_ - minSliderValue);
};

/**
 * Computes the slider value from the state value.
 * @param {number} stateValue State value. Like gain or pan.
 * @return {number} The corresponding slider value.
 * @private
 */
audioCat.ui.widget.SliderWidget.prototype.computeSliderValue_ =
    function(stateValue) {
  var minStateValue = this.minStateValue_;
  var minSliderValue = this.minSliderValue_;
  return minSliderValue + Math.round((stateValue - minStateValue) *
      (this.maxSliderValue_ - minSliderValue) /
          this.stateDifference_);
};

/**
 * Sets the new state value. Alters the slider if the state value differs.
 * @param {number} stateValue The new state value.
 */
audioCat.ui.widget.SliderWidget.prototype.setStateValue =
    function(stateValue) {
  var sliderElement = this.sliderElement_;
  var newSliderValue = this.computeSliderValue_(stateValue);
  if (newSliderValue != sliderElement.value) {
    // Take no action if the state value did not change enough to change the
    // slider.
    sliderElement.value = newSliderValue;
  this.setValueDisplayer_(stateValue);
  }
};

/** @override */
audioCat.ui.widget.SliderWidget.prototype.cleanUp = function() {
  var unlistenFunction = goog.events.unlisten;
  var sliderElement = this.sliderElement_;
  unlistenFunction(sliderElement, 'change',
      this.handleSliderValueChange_, false, this);
  unlistenFunction(sliderElement, 'input',
      this.handleSliderValueChange_, false, this);
  var domHelper = this.domHelper_;

  domHelper.unlistenForUpPress(sliderElement,
      this.handleSliderStableValueChange_, false, this);
  domHelper.unlistenForUpPress(this.sliderLabelContainer_,
      this.handleSliderLabelContainerClicked_, false, this);

  // Just to be sure, remove references to callbacks.
  this.performAsSliderShifts(goog.nullFunction);
  this.performOnStableConfiguration(goog.nullFunction);

  audioCat.ui.widget.SliderWidget.base(this, 'cleanUp');
};
