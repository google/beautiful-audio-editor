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
goog.provide('audioCat.ui.tracks.effect.FxAppearButtonManager');

goog.require('audioCat.state.effect.EventType');
goog.require('goog.dom.classes');
goog.require('goog.events');



/**
 * Manages the button that controls whether the effects clip alterer appears.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment - a segment like a track of audio.
 * @param {!audioCat.ui.tracks.effect.EffectChipsAlterer} effectChipsAlterer
 *     Manages chips representing effects for a segment of audio.
 * @param {!Element} buttonElement The element representing the button.
 * @constructor
 */
audioCat.ui.tracks.effect.FxAppearButtonManager = function(
    domHelper,
    effectManager,
    effectChipsAlterer,
    buttonElement) {

  /**
   * The element for the button.
   * @private {!Element}
   */
  this.buttonElement_ = buttonElement;

  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages effects for the track.
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = effectManager;

  /**
   * Manages chips that produce effects.
   * @private {!audioCat.ui.tracks.effect.EffectChipsAlterer}
   */
  this.effectChipsAlterer_ = effectChipsAlterer;

  /**
   * Whether we are currently indicating to the user that we have effects.
   * @private {boolean}
   */
  this.effectsExistIndicated_ = false;
  this.visuallyMarkHaveEffectsState_(effectManager.getNumberOfEffects() > 0);

  // Listen for button click. Upon clicking on the button, make the alterer
  // elements appear.
  domHelper.listenForUpPress(buttonElement, this.handleUpPress_, false, this);

  // When an effect is added, notify user that there is at least 1 effect.
  goog.events.listen(effectManager,
      audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);

  // When an effect is removed, notify user that there is at least 1 effect.
  goog.events.listen(effectManager,
      audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);

  // When an effect is moved, display the effect alterer so that the user can
  // see the results of the movement.
  goog.events.listen(effectManager,
      audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);
};

/**
 * Handles what happens when the button is up-pressed, ie toggles whether the
 * UI for altering effect chips are displayed.
 * @private
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.handleUpPress_ =
    function() {
  var effectChipsAlterer = this.effectChipsAlterer_;
  effectChipsAlterer.setDisplayState(!effectChipsAlterer.getDisplayState());
};

/**
 * Handles what happens when an effect is added.
 * @private
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.handleEffectAdded_ =
    function() {
  this.visuallyMarkHaveEffectsState_(true);
};

/**
 * Handles what happens when an effect is removed.
 * @private
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.handleEffectRemoved_ =
    function() {
  this.visuallyMarkHaveEffectsState_(
      this.effectManager_.getNumberOfEffects() > 0);
};

/**
 * Handles what happens when an effect is moved. Specifically, displays the
 * effect alterer UI so that the user can see the results of the move.
 * @private
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.handleEffectMoved_ =
    function() {
  this.effectChipsAlterer_.setDisplayState(true);
};

/**
 * Visually displays the button as either having effects or not.
 * @param {boolean} hasEffects Whether we have effects.
 * @private
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.
    visuallyMarkHaveEffectsState_ = function(hasEffects) {

  if (this.effectsExistIndicated_ != hasEffects) {
    var buttonElement = this.buttonElement_;
    var functionToUse = hasEffects ?
        goog.dom.classes.add : goog.dom.classes.remove;
    functionToUse(buttonElement, goog.getCssName('fxAppearButtonHasEffects'));
    this.effectsExistIndicated_ = hasEffects;
  }
};

/**
 * Unsets listeners and generally ensures no memory leaks when this object is
 * done being used.
 */
audioCat.ui.tracks.effect.FxAppearButtonManager.prototype.cleanUp = function() {
  var domHelper = this.domHelper_;
  var buttonElement = this.buttonElement_;
  var effectManager = this.effectManager_;

  domHelper.unlistenForUpPress(
      buttonElement, this.handleUpPress_, false, this);

  var unlistenFunction = goog.events.unlisten;
  unlistenFunction(effectManager,
      audioCat.state.effect.EventType.EFFECT_ADDED,
      this.handleEffectAdded_, false, this);
  unlistenFunction(effectManager,
      audioCat.state.effect.EventType.EFFECT_REMOVED,
      this.handleEffectRemoved_, false, this);
  unlistenFunction(effectManager,
      audioCat.state.effect.EventType.EFFECT_MOVED,
      this.handleEffectMoved_, false, this);
};
