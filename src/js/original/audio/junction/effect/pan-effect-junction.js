goog.provide('audioCat.audio.junction.effect.PanEffectJunction');

goog.require('audioCat.audio.junction.PanJunction');
goog.require('audioCat.audio.junction.Type');
goog.require('audioCat.audio.junction.effect.EffectJunction');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.field.EventType');
goog.require('goog.asserts');
goog.require('goog.events');


/**
 * An audio junction that implements an effect for panning left or right.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context and interfaces with the web audio API in general.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.effect.PanEffect} effect The effect.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between various audio units and standards.
 * @constructor
 * @extends {audioCat.audio.junction.PanJunction}
 * @implements {audioCat.audio.junction.effect.EffectJunction}
 */
audioCat.audio.junction.effect.PanEffectJunction = function(
    audioContextManager,
    idGenerator,
    effect,
    audioUnitConverter) {
  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  var panField = effect.getPanField();
  goog.base(
      this,
      idGenerator,
      audioContextManager,
      panField.getValue());

  /**
   * Listeners for changes in various fields of the effect. We maintain the keys
   * for these listeners so that we can remove them when we clean up later.
   * @private {!Array.<!goog.events.Key>}
   */
  this.listeners_ = [
      goog.events.listen(panField,
          audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
          this.handlePanChange_, false, this)
    ];
};
goog.inherits(audioCat.audio.junction.effect.PanEffectJunction,
    audioCat.audio.junction.PanJunction);

/**
 * Handles changes in the pan value.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.audio.junction.effect.PanEffectJunction.prototype.handlePanChange_ =
    function(event) {
  this.setPan(/** @type {!audioCat.state.effect.field.GradientField} */ (
      event.target).getValue());
};

/** @override */
audioCat.audio.junction.effect.PanEffectJunction.prototype.cleanUp =
    function() {
  for (var i = 0; i < this.listeners_.length; ++i) {
    goog.events.unlistenByKey(this.listeners_[i]);
  }
  goog.base(this, 'cleanUp');
};
