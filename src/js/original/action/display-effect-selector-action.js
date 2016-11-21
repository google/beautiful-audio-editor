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
goog.provide('audioCat.action.DisplayEffectSelectorAction');

goog.require('audioCat.state.command.AddEffectCommand');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.dialog.EventType');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.string');


/**
 * An action for displaying the dialog for selecting an effect.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo/redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages different models of effects we can apply. Like lowpass, highpass,
 *     etc.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Applies
 *     effects to the whole audio project.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.DisplayEffectSelectorAction = function(
    domHelper,
    commandManager,
    dialogManager,
    effectModelController,
    masterEffectManager,
    idGenerator) {
  audioCat.action.DisplayEffectSelectorAction.base(this, 'constructor');

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  /**
   * @private {!audioCat.state.effect.EffectModelController}
   */
  this.effectModelController_ = effectModelController;

  /**
   * The master effect manager that applies to the whole project.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.masterEffectManager_ = masterEffectManager;

  /**
   * The effect manager that is currently being applied.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.currentEffectManager_ = masterEffectManager;

  var modelsToDisplay = [
      audioCat.state.effect.EffectId.ALLPASS,
      audioCat.state.effect.EffectId.BANDPASS,
      audioCat.state.effect.EffectId.LOWPASS,
      audioCat.state.effect.EffectId.LOWSHELF,
      audioCat.state.effect.EffectId.HIGHPASS,
      audioCat.state.effect.EffectId.HIGHSHELF,
      audioCat.state.effect.EffectId.NOTCH,
      audioCat.state.effect.EffectId.PEAKING,
      audioCat.state.effect.EffectId.GAIN,
      audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR,
      audioCat.state.effect.EffectId.PAN,
      audioCat.state.effect.EffectId.REVERB
    ];
  /**
   * The list of effect models to display in order.
   * @private
   */
  this.modelsToDisplay_ = modelsToDisplay;

  var effectItems = {};
  /**
   * A mapping from effect ID -> the list item for that effect.
   * @private {!Object.<!audioCat.state.effect.EffectId, !Element>}
   */
  this.effectItems_ = effectItems;

  /**
   * The most recently displayed dialog for adding effects. Could be null.
   * @private {?audioCat.ui.dialog.DialogWidget}
   */
  this.dialog_ = null;

  /**
   * The key for the listener of when the dialog is canceled.
   * @private {goog.events.Key}
   */
  this.keyForCancelDialogListener_ = null;

  /**
   * An HTML list of the items - one for each effect model.
   * @private {!Element}
   */
  this.listHtmlElement_ = domHelper.createElement('ul');
  goog.dom.classes.add(this.listHtmlElement_,
      goog.getCssName('effectModelSelectionList'));

  // Generate the relevant list items.
  for (var i = 0; i < modelsToDisplay.length; ++i) {
    var modelId = modelsToDisplay[i];
    var model = effectModelController.getModelFromId(modelId);
    var listItem = domHelper.createElement('li');

    // Create the portion of the item for displaying the name of the filter.
    var filterNamePortion = domHelper.createElement('span');
    goog.dom.classes.add(
        filterNamePortion, goog.getCssName('filterNamePortion'));
    domHelper.setTextContent(filterNamePortion, model.getName());
    domHelper.appendChild(listItem, filterNamePortion);

    // Create the portion of the item for displaying the filter description.
    var filterDescriptionPortion = domHelper.createElement('span');
    goog.dom.classes.add(
        filterNamePortion, goog.getCssName('filterDescriptionPortion'));
    domHelper.setTextContent(filterDescriptionPortion, model.getDescription());
    domHelper.appendChild(listItem, filterDescriptionPortion);

    listItem.setAttribute('data-m', '' + modelId);
    effectItems[modelId] = listItem;
    domHelper.appendChild(this.listHtmlElement_, listItem);
  }

  // Create a new effect when an item is clicked.
  // TODO(chizeng): Remove this listener when the track is cleaned up.
  domHelper.listenForUpPress(this.listHtmlElement_,
      this.handleModelListUpPress_, false, this);
};
goog.inherits(
    audioCat.action.DisplayEffectSelectorAction, audioCat.action.Action);

/**
 * Handles what happens when a list item representing an effect model is
 * clicked.
 * @param {!goog.events.Event} e The associated event.
 * @private
 */
audioCat.action.DisplayEffectSelectorAction.prototype.handleModelListUpPress_ =
    function(e) {
  var element = /** @type {!Element} */ (e.target);
  var modelId = element.getAttribute('data-m');

  // Attempt to retrieve the model ID from the parent if this still fails.
  if (!modelId) {
    modelId = this.domHelper_.getParentElement(element).getAttribute('data-m');
  }

  if (modelId) {
    // Create a new effect instance.
    var effectModelController = this.effectModelController_;
    modelId = /** @type {audioCat.state.effect.EffectId} */ (
        goog.string.toNumber(modelId));
    var effect = effectModelController.getModelFromId(modelId).
        createDefaultEffect(effectModelController, this.idGenerator_);

    // Add the effect.
    var effectManager = this.currentEffectManager_;
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.AddEffectCommand(
            effectManager,
            effect,
            effectManager.getNumberOfEffects(),
            this.idGenerator_));

    // Remove the dialog.
    goog.asserts.assert(this.dialog_);
    this.dialogManager_.hideDialog(this.dialog_);
    this.dialog_ = null;

    // Remove the listener for cancel to be clicked.
    goog.events.unlistenByKey(this.keyForCancelDialogListener_);
    this.keyForCancelDialogListener_ = null;
  }
};

/**
 * Sets the effect manager to apply changes to.
 * @param {!audioCat.state.effect.EffectManager} opt_effectManager The effect
 *     manager to apply changes to. If not provided, defaults to the master
 *     effect manager.
 */
audioCat.action.DisplayEffectSelectorAction.prototype.setEffectManager =
    function(opt_effectManager) {
  this.currentEffectManager_ = opt_effectManager || this.masterEffectManager_;
};

/** @override */
audioCat.action.DisplayEffectSelectorAction.prototype.doAction = function() {
  // Create content.
  var domHelper = this.domHelper_;
  var dialogContent = domHelper.createElement('div');

  var title = domHelper.createElement('h2');
  domHelper.setTextContent(title, 'Add Effect');
  domHelper.appendChild(dialogContent, title);

  // Tell users what they are adding effects to.
  var addingToString = domHelper.createElement('p');
  domHelper.setTextContent(addingToString,
      '(to ' + this.currentEffectManager_.getAudioSegmentLabel() + ')');
  domHelper.appendChild(dialogContent, addingToString);

  // Append the list of available effect models.
  domHelper.appendChild(dialogContent, this.listHtmlElement_);

  // Create a cancelable dialog.
  var dialogManager = this.dialogManager_;
  var dialog = dialogManager.obtainDialog(dialogContent,
      audioCat.ui.dialog.DialogText.CLOSE);

  // Store the dialog so that we can later hide it.
  this.dialog_ = dialog;

  // Remove the dialog reference when cancel is clicked.
  this.keyForCancelDialogListener_ = goog.events.listenOnce(dialog,
      audioCat.ui.dialog.EventType.HIDE_DIALOG_REQUESTED, function() {
        this.dialog_ = null;
        this.keyForCancelDialogListener_ = null;
      }, false, this);

  // Show the dialog.
  dialogManager.showDialog(dialog);
};
