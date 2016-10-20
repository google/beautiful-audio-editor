goog.provide('audioCat.state.effect.EffectModel');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');


/**
 * Models the parameters for an effect.
 * @param {audioCat.state.effect.EffectId} effectId The ID of the effect. The
 *     effect model controller uses this ID to map to this model.
 * @param {audioCat.state.effect.EffectCategory} effectCategory The category of
 *     the effect. Is it a filter for instance?
 * @param {string} name The lowercase name of the effect.
 * @param {string} abbreviation The abbreviation of the effect. Used for compact
 *     display.
 * @param {string} description The description of the effect.
 * @constructor
 */
audioCat.state.effect.EffectModel = function(
    effectId,
    effectCategory,
    name,
    abbreviation,
    description) {
  /**
   * The ID of the effect.
   * @private {audioCat.state.effect.EffectId}
   */
  this.effectId_ = effectId;

  /**
   * The category of the effect.
   * @private {audioCat.state.effect.EffectCategory}
   */
  this.effectCategory_ = effectCategory;

  /**
   * The name of the effect.
   * @private {string}
   */
  this.name_ = name;

  /**
   * The abbreviation of the effect.
   * @private {string}
   */
  this.abbreviation_ = abbreviation;

  /**
   * The description of the effect.
   * @private {string}
   */
  this.description_ = description;
};

/**
 * Creates a default effect instance of this model.
 * @param {!audioCat.state.effect.EffectModelController} effectModelController
 *     Manages the different models of effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @return {!audioCat.state.effect.Effect} The effect created.
 */
audioCat.state.effect.EffectModel.prototype.createDefaultEffect =
    goog.abstractMethod;

/**
 * @return {audioCat.state.effect.EffectId} The effect ID.
 */
audioCat.state.effect.EffectModel.prototype.getEffectModelId = function() {
  return this.effectId_;
};

/**
 * @return {audioCat.state.effect.EffectCategory} The category of the effect.
 */
audioCat.state.effect.EffectModel.prototype.getEffectCategory = function() {
  return this.effectCategory_;
};

/**
 * @return {string} The name of the effect.
 */
audioCat.state.effect.EffectModel.prototype.getName = function() {
  return this.name_;
};

/**
 * @return {string} The lowercased abbreviation of the effect.
 */
audioCat.state.effect.EffectModel.prototype.getAbbreviation = function() {
  return this.abbreviation_;
};

/**
 * @return {string} The description of the effect.
 */
audioCat.state.effect.EffectModel.prototype.getDescription = function() {
  return this.description_;
};
