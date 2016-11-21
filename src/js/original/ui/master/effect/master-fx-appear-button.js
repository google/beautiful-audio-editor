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
goog.provide('audioCat.ui.master.effect.MasterEffectAppearButton');

goog.require('audioCat.ui.master.MainMasterButton');
goog.require('audioCat.ui.tracks.effect.FxAppearButtonManager');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A widget that toggles whether the master effects feature appears.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects
 *     for a certain segment - a segment like a track of audio.
 * @param {!audioCat.ui.tracks.effect.EffectChipsAlterer} effectChipsAlterer
 *     Manages chips representing effects for a segment of audio.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.effect.MasterEffectAppearButton = function(
    domHelper,
    effectManager,
    effectChipsAlterer) {
  var buttonElement = new audioCat.ui.master.MainMasterButton(domHelper, 'FX')
      .getDom();
  goog.dom.classes.add(buttonElement, goog.getCssName('masterFxButton'));
  goog.base(this, buttonElement);

  /**
   * Manages the button for toggling whether the chips alterer appear.
   * @private {!audioCat.ui.tracks.effect.FxAppearButtonManager}
   */
  this.fxAppearManager_ = new audioCat.ui.tracks.effect.FxAppearButtonManager(
      domHelper,
      effectManager,
      effectChipsAlterer,
      buttonElement);
};
goog.inherits(audioCat.ui.master.effect.MasterEffectAppearButton,
    audioCat.ui.widget.Widget);
