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
goog.provide('audioCat.state.effect.EffectModelController');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectModel');
goog.require('audioCat.state.effect.model.AllPassModel');
goog.require('audioCat.state.effect.model.BandPassModel');
goog.require('audioCat.state.effect.model.DynamicCompressorModel');
goog.require('audioCat.state.effect.model.GainModel');
goog.require('audioCat.state.effect.model.HighPassModel');
goog.require('audioCat.state.effect.model.HighShelfModel');
goog.require('audioCat.state.effect.model.LowPassModel');
goog.require('audioCat.state.effect.model.LowShelfModel');
goog.require('audioCat.state.effect.model.NotchModel');
goog.require('audioCat.state.effect.model.PanModel');
goog.require('audioCat.state.effect.model.PeakingModel');
goog.require('audioCat.state.effect.model.ReverbModel');


/**
 * Manages models of effects - general templates for effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @constructor
 */
audioCat.state.effect.EffectModelController = function(idGenerator) {
  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  var idToModelMapping = {};
  /**
   * A mapping from effect model ID to model.
   * @private {!Object.<audioCat.state.effect.EffectId,
   *     !audioCat.state.effect.EffectModel>}
   */
  this.idToModelMapping_ = idToModelMapping;
  idToModelMapping[audioCat.state.effect.EffectId.BANDPASS] =
      new audioCat.state.effect.model.BandPassModel();
  idToModelMapping[audioCat.state.effect.EffectId.LOWPASS] =
      new audioCat.state.effect.model.LowPassModel();
  idToModelMapping[audioCat.state.effect.EffectId.HIGHPASS] =
      new audioCat.state.effect.model.HighPassModel();
  idToModelMapping[audioCat.state.effect.EffectId.LOWSHELF] =
      new audioCat.state.effect.model.LowShelfModel();
  idToModelMapping[audioCat.state.effect.EffectId.HIGHSHELF] =
      new audioCat.state.effect.model.HighShelfModel();
  idToModelMapping[audioCat.state.effect.EffectId.PEAKING] =
      new audioCat.state.effect.model.PeakingModel();
  idToModelMapping[audioCat.state.effect.EffectId.NOTCH] =
      new audioCat.state.effect.model.NotchModel();
  idToModelMapping[audioCat.state.effect.EffectId.ALLPASS] =
      new audioCat.state.effect.model.AllPassModel();
  idToModelMapping[audioCat.state.effect.EffectId.GAIN] =
      new audioCat.state.effect.model.GainModel();
  idToModelMapping[audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR] =
      new audioCat.state.effect.model.DynamicCompressorModel();
  idToModelMapping[audioCat.state.effect.EffectId.PAN] =
      new audioCat.state.effect.model.PanModel();
  idToModelMapping[audioCat.state.effect.EffectId.REVERB] =
      new audioCat.state.effect.model.ReverbModel();
};

/**
 * Retrieves the model of an effect from the ID.
 * @param {audioCat.state.effect.EffectId} effectModelId The ID of the effect
 *     model.
 * @return {!audioCat.state.effect.EffectModel} The associated effect model.
 */
audioCat.state.effect.EffectModelController.prototype.getModelFromId =
    function(effectModelId) {
  return this.idToModelMapping_[effectModelId];
};

/**
 * Creates and retrieves a list of newly created default effect objects for the
 * master effect manager.
 * @return {!Array.<!audioCat.state.effect.Effect>} The list of effects to be
 *     assigned by default to the master effect manager.
 */
audioCat.state.effect.EffectModelController.prototype.getDefaultMasterEffects =
    function() {
  return [
      this.getModelFromId(audioCat.state.effect.EffectId.DYNAMIC_COMPRESSOR).
          createDefaultEffect(this, this.idGenerator_),
      this.getModelFromId(audioCat.state.effect.EffectId.PAN).
          createDefaultEffect(this, this.idGenerator_),
      this.getModelFromId(audioCat.state.effect.EffectId.GAIN).
          createDefaultEffect(this, this.idGenerator_)
    ];
};
