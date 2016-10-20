goog.provide('audioCat.state.effect.Effect');

goog.require('audioCat.state.effect.HighlightedStateChangedEvent');
goog.require('audioCat.utility.EventTarget');


/**
 * An effect that can be applied to alter audio.
 * @param {!audioCat.state.effect.EffectModel} model The model of the effect
 *     that describes details about the model such as name and description.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.effect.Effect = function(model, idGenerator) {
  goog.base(this);

  /**
   * Contains information about the nature of the effect such as name and
   * description.
   * @private {!audioCat.state.effect.EffectModel}
   */
  this.model_ = model;

  /**
   * The ID of the effect. Unique throughout the application.
   * @private {audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();
};
goog.inherits(audioCat.state.effect.Effect, audioCat.utility.EventTarget);

/**
 * @return {!audioCat.state.effect.EffectModel} The model of the effect that
 *     contains all sorts of meta information about it.
 */
audioCat.state.effect.Effect.prototype.getModel = function() {
  return this.model_;
};

/**
 * @return {!audioCat.utility.Id} A unique ID for this effect.
 */
audioCat.state.effect.Effect.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {!Array.<!audioCat.ui.helperPanel.Type.Displayable>} A generated list
 *     of displayables (entities that can be displayed).
 */
audioCat.state.effect.Effect.prototype.retrieveDisplayables =
    goog.abstractMethod;

/**
 * Notes that the highlighted state of this effect changed. An effect may be
 * highlighted for instance if it is displayed on the helper panel for editting.
 * @param {boolean} newHighlightedState The new highlighted state.
 */
audioCat.state.effect.Effect.prototype.noteChangeInHighlightState =
    function(newHighlightedState) {
  this.dispatchEvent(new audioCat.state.effect.HighlightedStateChangedEvent(
      newHighlightedState));
};
