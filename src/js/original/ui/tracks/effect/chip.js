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
goog.provide('audioCat.ui.tracks.effect.Chip');

goog.require('audioCat.state.effect.EventType');
goog.require('audioCat.ui.templates');
goog.require('audioCat.ui.tracks.effect.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('soy');


/**
 * Represents the presence of an effect in the UI.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.effect.Effect} effect The effect that this chip
 *     represents.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.tracks.effect.Chip = function(domHelper, effect) {
  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * The associated effect.
   * @private {!audioCat.state.effect.Effect}
   */
  this.effect_ = effect;

  var effectModel = effect.getModel();
  // The ID of the effect instance is stored in the data-e attribute of this
  // HTML element.
  var container = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.templates.EffectChip, {
          effectId: effect.getId(),
          effectName: effectModel.getName(),
          effectAbbreviation: effectModel.getAbbreviation()
      }));
  goog.base(this, container);

  /**
   * The button for deleting the effect.
   * @private {!Element}
   */
  this.deleteEffectButton_ = domHelper.getElementByClassForSure(
      goog.getCssName('removeEffectChipButton'), container);

  // Issue a request to delete the effect if the button is clicked.
  domHelper.listenForUpPress(this.deleteEffectButton_,
      this.handleDeleteButtonClicked_, false, this);

  // Listen for when the user presses up from this, so that we can for instance
  // display the helper panel.
  domHelper.listenForUpPress(this.getDom(), this.handleUpPress_, false, this);

  // Note changes in the highlighted state of the effect.
  goog.events.listen(effect,
      audioCat.state.effect.EventType.EFFECT_HIGHLIGHTED_STATE_CHANTED,
      this.handleEffectHighlightedStateChanged_, false, this);
};
goog.inherits(audioCat.ui.tracks.effect.Chip, audioCat.ui.widget.Widget);

/**
 * Handles what happens when the user presses up from the chip.
 * @private
 */
audioCat.ui.tracks.effect.Chip.prototype.handleUpPress_ = function() {
  this.dispatchEvent(audioCat.ui.tracks.effect.EventType.CHIP_TAPPED);
};

/**
 * Handles what happens when the delete button is clicked. Issues a request for
 * this effect to be deleted.
 * @param {!goog.events.Event} event The associated event.
 * @return {boolean} False in order to help prevent the default action.
 * @private
 */
audioCat.ui.tracks.effect.Chip.prototype.handleDeleteButtonClicked_ =
    function(event) {
  event.stopPropagation();
  event.preventDefault();
  this.dispatchEvent(audioCat.ui.tracks.effect.EventType.REQUEST_DELETE_EFFECT);
  return false;
};

/**
 * @return {!audioCat.state.effect.Effect} The associated effect.
 */
audioCat.ui.tracks.effect.Chip.prototype.getEffect = function() {
  return this.effect_;
};

/**
 * Handles changse in whether the effect is highlighted in the UI.
 * @param {!audioCat.state.effect.HighlightedStateChangedEvent} event The
 *     event associated with the change.
 * @private
 */
audioCat.ui.tracks.effect.Chip.prototype.handleEffectHighlightedStateChanged_ =
    function(event) {
  (event.newHighlightedState ? goog.dom.classes.add : goog.dom.classes.remove)(
      this.getDom(), goog.getCssName('chipForHighlightedEffect'));
};

/** @override */
audioCat.ui.tracks.effect.Chip.prototype.cleanUp = function() {
  var domHelper = this.domHelper_;
  domHelper.unlistenForUpPress(this.deleteEffectButton_,
      this.handleDeleteButtonClicked_, false, this);
  domHelper.unlistenForUpPress(this.getDom(), this.handleUpPress_, false, this);
  goog.events.unlisten(this.effect_,
      audioCat.state.effect.EventType.EFFECT_HIGHLIGHTED_STATE_CHANTED,
      this.handleEffectHighlightedStateChanged_, false, this);
  audioCat.ui.tracks.effect.Chip.base(this, 'cleanUp');
};
