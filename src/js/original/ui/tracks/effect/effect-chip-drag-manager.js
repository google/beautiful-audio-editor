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
goog.provide('audioCat.ui.tracks.effect.EffectChipDragManager');

goog.require('audioCat.state.command.MoveEffectCommand');
goog.require('audioCat.ui.dragList.DragListGroup');
goog.require('goog.asserts');
goog.require('goog.dom.dataset');
goog.require('goog.fx.DragListGroup.EventType');
goog.require('goog.object');
goog.require('goog.string');


/**
 * @typedef {{
 *     effectManager: !audioCat.state.effect.EffectManager,
 *     container: !Element
 * }}
 */
var EffectManagerElementEntry;


/**
 * Manages the dragging of all effect chips across tracks.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands, so users can redo and undo.
 * @constructor
 */
audioCat.ui.tracks.effect.EffectChipDragManager = function(
    idGenerator,
    domHelper,
    commandManager) {
  // TODO(chizeng): Feed this thing a list of effect managers upon loading a
  // project so that we don't have to repeatedly init.

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
   * The effect manager ID of the previous initial drag list. Meaningless if no
   * drag has occurred.
   * @private {number}
   */
  this.previousInitialDragListEffectManagerId_ = 0;

  /**
   * A mapping from effect manager ID to the above record type, which contains
   * both the effect manager ID and the container of effect chips.
   * @private {!Object.<!EffectManagerElementEntry>}
   */
  this.effectManagerIdEntryMapping_ = {};

  /**
   * The current drag list group, which binds together several containers for
   * dragging.
   * @private {!audioCat.ui.dragList.DragListGroup}
   */
  this.dragListGroup_ = this.createDragGroup_();
};


/**
 * The name of the HTML attribute storing the ID of either the effect manager or
 * the effect.
 * @type {string}
 * @const
 */
audioCat.ui.tracks.effect.EffectChipDragManager.CHIP_KEY_NAME = 'e';


/**
 * Adds a new effect segment to this manager.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {!Element} container The container for the effect chips for this
 *     effect manager.
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.addEntry =
    function(effectManager, container) {
  this.effectManagerIdEntryMapping_[effectManager.getId()] = {
      effectManager: effectManager,
      container: container
    };

  // Reclaim the memory for the previous drag list group. Make new one.
  this.dragListGroup_.dispose();
  this.dragListGroup_ = this.createDragGroup_();
};

/**
 * Removes an entry. And thus removes a single container for effect chips.
 * @param {!audioCat.state.effect.EffectManager} effectManager The effect
 *     manager to remove the entry for.
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.removeEntry =
    function(effectManager) {
  delete this.effectManagerIdEntryMapping_[effectManager.getId()];
};

/**
 * Adds a single effect chip to its respective dragging container. Also adds the
 * chip to the DOM.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment of audio.
 * @param {!audioCat.ui.tracks.effect.Chip} chip The effect chip.
 * @param {number=} opt_index The index at which to add the chip. Defaults to
 *     the last available index.
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.addEffectChip =
    function(effectManager, chip, opt_index) {
  this.dragListGroup_.addItemToDragList(
      this.effectManagerIdEntryMapping_[effectManager.getId()].container,
      chip.getDom(),
      opt_index);
};

/**
 * Creates a new drag list group with the stored drag list containers.
 * @return {!audioCat.ui.dragList.DragListGroup}
 * @private
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.createDragGroup_ =
    function() {
  var dragListGroup = new audioCat.ui.dragList.DragListGroup();
  // TODO(chizeng): Find out how to connect this with the effect manager.
  // Perhaps create the listener right in the anonymous function.
  goog.object.forEach(this.effectManagerIdEntryMapping_, function(entry) {
      dragListGroup.addListGrowingRight(entry.container);
    }, this);

  // Assign a class to the item actually moving around during dragging.
  dragListGroup.setDraggerElClass(goog.getCssName('dragger'));

  // Wait until the user drags 10 pixels to count the action as a drag. This
  // allows the user to delete chips via clicking on the remove button.
  dragListGroup.setHysteresis(10);

  // Listen for before drag begins as well as when drag finishes.
  dragListGroup.listen(goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
      this.handleBeforeDragStart_, false, this);
  dragListGroup.listen(goog.fx.DragListGroup.EventType.DRAGEND,
      this.handleDragEnd_, false, this);

  dragListGroup.init();
  return dragListGroup;
};

/**
 * Handles what happens right before dragging an effect clip begins.
 * @param {!goog.fx.DragListGroupEvent} e The associated event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.
    handleBeforeDragStart_ = function(e) {
  // Store the effect manager ID of the previous effect manager (before drag).
  this.previousInitialDragListEffectManagerId_ =
      goog.string.toNumber(/** @type {string} */ (goog.dom.dataset.get(
          this.domHelper_.getParentElement(e.currDragItem),
          audioCat.ui.tracks.effect.EffectChipDragManager.CHIP_KEY_NAME
        )));
};

/**
 * Handles what happens when the dragging of an effect clip ends.
 * @param {!goog.fx.DragListGroupEvent} e The associated event.
 * @private
 */
audioCat.ui.tracks.effect.EffectChipDragManager.prototype.handleDragEnd_ =
    function(e) {
  // Obtain the IDs of the effect and the previous effect manager.
  var chip = e.currDragItem;
  var effectIdString = /** @type {string} */ (goog.dom.dataset.get(
      chip, audioCat.ui.tracks.effect.EffectChipDragManager.CHIP_KEY_NAME));
  var effectId = goog.string.toNumber(effectIdString);
  var previousEffectManagerId = this.previousInitialDragListEffectManagerId_;

  // Obtain the ID of the new effect manager.
  var domHelper = this.domHelper_;
  var newEffectManagerId = goog.string.toNumber(/** @type {string} */ (
      goog.dom.dataset.get(
          domHelper.getParentElement(chip),
          audioCat.ui.tracks.effect.EffectChipDragManager.CHIP_KEY_NAME)));

  // Find the previous index of the effect into the previous effect manager.
  var previousEffectIndex;
  var mapping = this.effectManagerIdEntryMapping_;
  var previousEffectManager = mapping[previousEffectManagerId].effectManager;
  var numberOfEffects = previousEffectManager.getNumberOfEffects();
  var effect;
  for (var i = 0; i < numberOfEffects; ++i) {
    effect = previousEffectManager.getEffectAtIndex(i);
    if (effectId == effect.getId()) {
      previousEffectIndex = i;
      break;
    }
  }
  goog.asserts.assert(goog.isDef(previousEffectIndex),
      'Previous effect not found.');
  goog.asserts.assert(goog.isDef(effect), 'Effect does not exist.');

  // Find the index of the effect into the new effect manager by iterating
  // across DOM elements.
  var newEffectIndex;
  var newEntry = mapping[newEffectManagerId];
  var newContainer = newEntry.container;
  var newEffectManager = newEntry.effectManager;
  var newContainerChips = domHelper.getChildren(newContainer);
  var numberOfChipsInNewContainer = newContainerChips.length;
  for (var i = 0; i < numberOfChipsInNewContainer; ++i) {
    if (newContainerChips[i] == chip) {
      newEffectIndex = i;
      break;
    }
  }
  goog.asserts.assert(goog.isDef(newEffectIndex),
      'New effect index not found.');

  if (previousEffectIndex != newEffectIndex ||
      previousEffectManagerId != newEffectManagerId) {
    // Only perform this command if a change was made.
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.MoveEffectCommand(
            previousEffectManager,
            previousEffectIndex,
            newEffectManager,
            newEffectIndex,
            this.idGenerator_));
  }
};
