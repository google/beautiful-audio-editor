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
goog.provide('audioCat.ui.tracks.effect.EffectChipsAlterer');

goog.require('audioCat.state.command.RemoveEffectCommand');
goog.require('audioCat.state.effect.EventType');
goog.require('audioCat.ui.templates');
goog.require('audioCat.ui.tracks.effect.Chip');
goog.require('audioCat.ui.tracks.effect.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.object');
goog.require('soy');


/**
 * A UI that allows the user to add/remove chips that represent effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands so that the user can undo and redo.
 * @param {!audioCat.ui.helperPanel.EffectContentProvider} effectContentProvider
 *     Provides content for the side panel when effects are set in focus.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects.
 * @param {!audioCat.audio.Analyser} audioAnalyser Analyses live audio.
 * @param {!audioCat.ui.tracks.effect.EffectChipDragManager}
 *     effectChipDragManager Manages the dragging of effect chips.
 * @param {!audioCat.action.DisplayEffectSelectorAction}
 *     displayEffectSelectorAction An action for displaying the dialog for
 *     creating new effects.
 * @param {boolean=} opt_show Whether to initially show this widget. Defaults to
 *     false.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.tracks.effect.EffectChipsAlterer = function(
    idGenerator,
    domHelper,
    commandManager,
    effectContentProvider,
    effectManager,
    audioAnalyser,
    effectChipDragManager,
    displayEffectSelectorAction,
    opt_show) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.ui.helperPanel.EffectContentProvider}
   */
  this.effectContentProvider_ = effectContentProvider;

  /**
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  /**
   * @private {!audioCat.audio.Analyser}
   */
  this.audioAnalyser_ = audioAnalyser;

  /**
   * @private {!audioCat.action.DisplayEffectSelectorAction}
   */
  this.displayEffectSelectorAction_ = displayEffectSelectorAction;

  var baseElement = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.templates.EffectChipAlterer, {
        effectManagerId: effectManager.getId()
      }));
  // Above, the ID of the effect manager is stored in the data-e attribute of
  // this HTML element.
  goog.base(this, baseElement);

  // When the user clicks on the + button, potentially add a new effect.
  // TODO(chizeng): Remove this listener upon cleaning up this object.
  var newEffectButton = domHelper.getElementByClassForSure(
      goog.getCssName('newEffectButton'), baseElement);
  /**
   * The button to press to add an effect.
   * @private {!Element}
   */
  this.newEffectButton_ = newEffectButton;

  /**
   * A mapping from effect instance ID to effect chip UI object.
   * @private {!Object.<!audioCat.utility.Id, !audioCat.ui.tracks.effect.Chip>}
   */
  this.idEffectChipMapping_ = {};

  /**
   * Contains chips representing effects.
   * @private {!Element}
   */
  this.effectChipsContainer_ = domHelper.getElementByClassForSure(
      goog.getCssName('effectChipContainer'), baseElement);

  /**
   * @private {!audioCat.ui.tracks.effect.EffectChipDragManager}
   */
  this.effectChipDragManager_ = effectChipDragManager;

  // Specify that people can drag chips to and from this container.
  effectChipDragManager.addEntry(effectManager, this.effectChipsContainer_);

  // Add chips for existing effects.
  var numberOfEffects = effectManager.getNumberOfEffects();
  for (var i = 0; i < numberOfEffects; ++i) {
    this.addChip_(effectManager.getEffectAtIndex(i), i);
  }

  /**
   * Whether the chips alterer is currently displayed.
   * @private {boolean}
   */
  this.displayed_ = true;
  // Initially hide the alter effect chips UI. The reversal triggers an action.
  this.setDisplayState(!!opt_show);

  // Listen to when the new effect button is up-pressed.
  domHelper.listenForUpPress(newEffectButton, this.handleNewEffectButtonPress_,
      false, this);

  // Listen to new effects being added and removed.
  var listenFunction = goog.events.listen;
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);
  listenFunction(effectManager, audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);
};
goog.inherits(audioCat.ui.tracks.effect.EffectChipsAlterer,
    audioCat.ui.widget.Widget);

/**
 * Cleans up the effect chip alterer. Call when it's done being used.
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.cleanUp = function() {
  var effectManager = this.effectManager_;
  goog.events.unlisten(effectManager,
      audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);
  goog.events.unlisten(effectManager,
      audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);
  goog.events.unlisten(effectManager,
      audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);
  this.domHelper_.unlistenForUpPress(this.newEffectButton_,
      this.handleNewEffectButtonPress_, false, this);

  // Remove all the chips, and clean up the listeners of chips.
  goog.object.forEach(this.idEffectChipMapping_, function(chip) {
    // Removes listeners on the chip, and tells the chip to clean itself up.
    this.removeEffectChip_(chip.getEffect());
  }, this);

  // Remove the draggable entry.
  this.effectChipDragManager_.removeEntry(this.effectManager_);
  audioCat.ui.tracks.effect.EffectChipsAlterer.base(this, 'cleanUp');
};

/**
 * Handles what happens when the an effect is added to the effect manager.
 * @param {!audioCat.state.effect.EffectListChangedEvent} e The associated
 *     event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.handleEffectAdded_ =
    function(e) {
  var effect = e.getEffect();
  this.addChip_(effect, e.getIndex());
  this.displayEffectPanel_(effect);
};

/**
 * Adds a chip for an effect to the alterer.
 * @param {!audioCat.state.effect.Effect} effect The effect to add a chip for.
 * @param {number} index The index at which to add the chip.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.addChip_ = function(
    effect, index) {
  var chip = new audioCat.ui.tracks.effect.Chip(this.domHelper_, effect);
  this.idEffectChipMapping_[effect.getId()] = chip;

  // TODO(chizeng): Remove, clean this listener up if this alterer is no longer
  //     needed.
  // Listen for when the chip requests that it be removed.
  var listenFunction = goog.events.listen;
  listenFunction(chip,
      audioCat.ui.tracks.effect.EventType.REQUEST_DELETE_EFFECT,
      this.handleChipRequestDelete_, false, this);
  listenFunction(chip,
      audioCat.ui.tracks.effect.EventType.CHIP_TAPPED,
      this.handleChipUpPress_, false, this);

  this.effectChipDragManager_.addEffectChip(
      this.effectManager_, chip, index);
};

/**
 * Handles what happens when the user presses up from a chip.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.handleChipUpPress_ =
    function(event) {
  this.displayEffectPanel_(
      /** @type {!audioCat.ui.tracks.effect.Chip} */ (event.target).
          getEffect());
};

/**
 * Makes the side helper panel display settings and options about an effect.
 * @param {!audioCat.state.effect.Effect} effect The effect to focus on.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.displayEffectPanel_ =
    function(effect) {
  this.effectContentProvider_.showEffect(
      this.effectManager_, this.audioAnalyser_, effect);
};

/**
 * Handles what happens when an effect is removed from the effect manager.
 * Specifically, removes the associated chip.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The associated
 *     event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.handleEffectRemoved_ =
    function(event) {
  this.removeEffectChip_(event.getEffect());
};

/**
 * Handles what happens when the index of an effect changes in the effect
 * manager (so the effect was moved).
 * Specifically, repositions the associated chip.
 * @param {!audioCat.state.effect.EffectListChangedEvent} event The associated
 *     event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.handleEffectMoved_ =
    function(event) {
  var domHelper = this.domHelper_;
  var chipDom = this.idEffectChipMapping_[event.getEffect().getId()].getDom();
  domHelper.removeNode(chipDom);
  domHelper.insertChildAt(
      this.effectChipsContainer_, chipDom, event.getIndex());
};

/**
 * Handles what happens when the user clicks up from the add new effect button.
 * Specifically, displays the dialog for adding new effects.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.
    handleNewEffectButtonPress_ = function() {
  var displayEffectSelectorAction = this.displayEffectSelectorAction_;
  displayEffectSelectorAction.setEffectManager(this.effectManager_);
  displayEffectSelectorAction.doAction();
};

/**
 * Handles what happens when a chip requests that it be deleted.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.
    handleChipRequestDelete_ = function(event) {
  var effectManager = this.effectManager_;

  // Perform a command that removes the effect associated with the chip.
  this.commandManager_.enqueueCommand(
      new audioCat.state.command.RemoveEffectCommand(
          effectManager,
          effectManager.obtainEffectIndexById(
              /** @type {!audioCat.ui.tracks.effect.Chip} */ (event.target).
                  getEffect().getId()),
          this.idGenerator_));
};

/**
 * Removes the chip associated with the given effect. Does not alter the state
 * of the effects. Only visually takes the chip out.
 * @param {!audioCat.state.effect.Effect} effect The effect to remove the chip
 *     of.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.removeEffectChip_ =
    function(effect) {
  var idToChipMapping = this.idEffectChipMapping_;
  var effectInstanceId = effect.getId();

  // Take it out of the DOM and the mapping.
  var chip = idToChipMapping[effectInstanceId];
  this.domHelper_.removeNode(chip.getDom());

  // Stop listening for deletion requests from the chip: it's already deleted.
  var unlistenFunction = goog.events.unlisten;
  unlistenFunction(chip,
      audioCat.ui.tracks.effect.EventType.REQUEST_DELETE_EFFECT,
      this.handleChipRequestDelete_, false, this);
  unlistenFunction(chip,
      audioCat.ui.tracks.effect.EventType.CHIP_TAPPED,
      this.handleChipUpPress_, false, this);

  // If the effect is currently displayed in the side helper panel, hide it.
  this.effectContentProvider_.hidePanelIfEffect(effect);

  delete idToChipMapping[effectInstanceId];
  chip.cleanUp();
};

/**
 * Sets whether the alterer is currently displayed. Updates the UI
 * appropriately.
 * @param {boolean} displayed
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.setDisplayState =
    function(displayed) {
  if (this.displayed_ != displayed) {
    (displayed ? goog.dom.classes.remove : goog.dom.classes.add)(
        this.getDom(), goog.getCssName('undisplayedElement'));
    this.displayed_ = displayed;
  }
};

/**
 * @return {boolean} Whether the effect chips alterer UI is displayed.
 */
audioCat.ui.tracks.effect.EffectChipsAlterer.prototype.getDisplayState =
    function() {
  return this.displayed_;
};
