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
goog.provide('audioCat.ui.master.MasterControllerWidget');

goog.require('audioCat.ui.master.MasterSettingsButton');
goog.require('audioCat.ui.master.effect.MasterEffectAppearButton');
goog.require('audioCat.ui.tracks.effect.EffectChipsAlterer');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * Manages master effects, settings, and possibly other configurations.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands so that the user can undo and redo.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     audio.
 * @param {number} numberOfOutputChannels The number of master output channels.
 * @param {!audioCat.ui.helperPanel.EffectContentProvider} effectContentProvider
 *     Provides content to the helper panel when an effect is put in focus.
 * @param {!audioCat.ui.helperPanel.MasterSettingsContentProvider}
 *     masterSettingsContentProvider Provides content that allows the user to
 *     edit master settings.
 * @param {!audioCat.state.effect.EffectManager} effectManager Manages effects.
 * @param {!audioCat.audio.Analyser} audioAnalyser Analyses live audio.
 * @param {!audioCat.ui.tracks.effect.EffectChipDragManager}
 *     effectChipDragManager Manages the dragging of effect chips.
 * @param {!audioCat.action.DisplayEffectSelectorAction}
 *     displayEffectSelectorAction An action for displaying the dialog for
 *     creating new effects.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.MasterControllerWidget = function(
    idGenerator,
    domHelper,
    actionManager,
    commandManager,
    playManager,
    numberOfOutputChannels,
    effectContentProvider,
    masterSettingsContentProvider,
    effectManager,
    audioAnalyser,
    effectChipDragManager,
    displayEffectSelectorAction) {
  var baseElement = domHelper.createElement('div');
  goog.dom.classes.add(baseElement, goog.getCssName('masterController'));
  goog.base(this, baseElement);

  // Add an effect chips alterer.
  var effectChipsAlterer = new audioCat.ui.tracks.effect.EffectChipsAlterer(
      idGenerator,
      domHelper,
      commandManager,
      effectContentProvider,
      effectManager,
      audioAnalyser,
      effectChipDragManager,
      displayEffectSelectorAction,
      effectManager.getNumberOfEffects() > 0);
  if (FLAG_MOBILE) {
    goog.dom.classes.add(effectChipsAlterer.getDom(),
        goog.getCssName('mobileEffectChipAlterer'));
  }
  domHelper.appendChild(baseElement, effectChipsAlterer.getDom());

  // Add the effects appear button.
  domHelper.appendChild(
      baseElement,
      new audioCat.ui.master.effect.MasterEffectAppearButton(
          domHelper,
          effectManager,
          effectChipsAlterer).getDom());

  // Add a button for toggling whether master settings appear.
  domHelper.appendChild(
      baseElement,
      new audioCat.ui.master.MasterSettingsButton(
          domHelper, masterSettingsContentProvider).getDom());
};
goog.inherits(audioCat.ui.master.MasterControllerWidget,
    audioCat.ui.widget.Widget);
