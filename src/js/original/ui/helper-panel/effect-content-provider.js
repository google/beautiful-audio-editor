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
goog.provide('audioCat.ui.helperPanel.EffectContentProvider');

goog.require('audioCat.state.effect.EffectCategory');
goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.ui.helperPanel.ContentProvider');
goog.require('audioCat.ui.widget.FrequencySpectrumAnalyser');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Provides content stemming from altering effects.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools
 *     contexts so we do not make too many.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     audio.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between audio units.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @constructor
 * @extends {audioCat.ui.helperPanel.ContentProvider}
 */
audioCat.ui.helperPanel.EffectContentProvider = function(
    idGenerator,
    domHelper,
    context2dPool,
    playManager,
    audioUnitConverter,
    commandManager,
    dialogManager,
    prefManager) {
  goog.base(this,
      idGenerator,
      domHelper,
      playManager,
      commandManager,
      dialogManager,
      prefManager);

  /**
   * Pools 2D contexts so that we don't create too many.
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * Converts between audio units.
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  /**
   * The current effect manager to use for visualization or null if none.
   * @private {audioCat.state.effect.EffectManager}
   */
  this.effectManager_ = null;

  /**
   * The current audio analyser to use for visualization or null if none.
   * @private {audioCat.audio.Analyser}
   */
  this.analyser_ = null;

  /**
   * The current effect to use for visualization or null if none.
   * @private {audioCat.state.effect.Effect}
   */
  this.effect_ = null;

  /**
   * Whether showing an effect is taking place. Used to guard against cleaning
   * up important properties like effect manager while changing to a different
   * effect to display a panel for.
   * @private {boolean}
   */
  this.effectBeingShown_ = false;
};
goog.inherits(audioCat.ui.helperPanel.EffectContentProvider,
    audioCat.ui.helperPanel.ContentProvider);

/**
 * @return {audioCat.state.effect.Effect} The current effect being highlighted
 *     if any. If none, null.
 */
audioCat.ui.helperPanel.EffectContentProvider.prototype.getEffect = function() {
  return this.effect_;
};

/**
 * Sets the current set of entities to use for visualization.
 * @param {!audioCat.state.effect.EffectManager} effectManager
 * @param {!audioCat.audio.Analyser} analyser
 * @param {!audioCat.state.effect.Effect} effect
 */
audioCat.ui.helperPanel.EffectContentProvider.prototype.showEffect =
    function(effectManager, analyser, effect) {
  if (this.effect_) {
    this.effect_.noteChangeInHighlightState(false);
  }

  this.effectBeingShown_ = true;
  this.effectManager_ = effectManager;
  this.analyser_ = analyser;
  this.effect_ = effect;

  // Have the effect inform other entities that it has been put in focus.
  effect.noteChangeInHighlightState(true);

  // Request that the helper retrieve content from this provider, and show the
  // resulting content.
  this.requestShow();
  this.effectBeingShown_ = false;
};

/**
 * Hides the effect panel if and only if the current effect is being
 * highlighted.
 * @param {!audioCat.state.effect.Effect} effect
 */
audioCat.ui.helperPanel.EffectContentProvider.prototype.hidePanelIfEffect =
    function(effect) {
  var effectBeingShown = this.effect_;
  if (effectBeingShown && effectBeingShown.getId() == effect.getId()) {
    // Have the effect inform other entities that it has been put out of focus.
    effect.noteChangeInHighlightState(false);

    // Request that the helper panel hide the panel and clean up its contents.
    this.requestHide();
  }
};

/** @override */
audioCat.ui.helperPanel.EffectContentProvider.prototype.retrieveInnerContent =
    function() {
  // Assumes that an active effect manager, analyser, and effect exist.
  goog.asserts.assert(this.effectManager_);
  var effectManager = this.effectManager_;

  goog.asserts.assert(this.analyser_);
  var analyser = this.analyser_;

  goog.asserts.assert(this.effect_);
  var effect = this.effect_;
  var model = effect.getModel();

  // TODO(chizeng): Retrieve content about the effect.
  var domHelper = this.domHelper;
  var innerContent = domHelper.createDiv(goog.getCssName('innerContent'));

  // Include a title.
  var title = domHelper.createElement('h2');
  goog.dom.classes.add(title, goog.getCssName('helperPanelTitle'));
  domHelper.setRawInnerHtml(title, model.getName() + ' for ' +
      effectManager.getAudioSegmentLabel());
  domHelper.appendChild(innerContent, title);

  // Include a description of the effect.
  var description = domHelper.createElement('p');
  goog.dom.classes.add(description, goog.getCssName('helperPanelDescription'));
  domHelper.setRawInnerHtml(description, model.getDescription());
  domHelper.appendChild(innerContent, description);

  var innerDisplayables = effect.retrieveDisplayables();
  for (var i = 0; i < innerDisplayables.length; ++i) {
    var widget = this.addAndStoreWidgets(innerContent, innerDisplayables[i]);
  }

  // Add a live frequency analyser for the segment of audio.
  var frequencyAnalyser = new audioCat.ui.widget.FrequencySpectrumAnalyser(
      this.domHelper,
      this.context2dPool_,
      this.playManager,
      this.audioUnitConverter_,
      /** @type {!audioCat.state.effect.EffectManager} */ (this.effectManager_),
      /** @type {!audioCat.audio.Analyser} */ (this.analyser_),
      effect);
  this.widgets.push(frequencyAnalyser);
  domHelper.appendChild(innerContent, frequencyAnalyser.getDom());

  // If the effect has a certain special frequency, highlight it with a line on
  // the frequency spectrum.
  if (model.getEffectCategory() ==
      audioCat.state.effect.EffectCategory.FILTER) {
    // All filter effects have a certain special frequency.
    effect = /** @type {!audioCat.state.effect.FilterEffect} */ (effect);
    var frequencyField = effect.getFrequencyField();
    frequencyAnalyser.setLineFrequency(frequencyField.getValue());
    // Listen for future changes in frequency, and change the line with it.
    this.listenKeys.push(goog.events.listen(
      frequencyField,
      audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED,
      function() {
        frequencyAnalyser.setLineFrequency(frequencyField.getValue());
      }, false, this));
  }

  return innerContent;
};

/** @override */
audioCat.ui.helperPanel.EffectContentProvider.prototype.cleanUpInnerContent =
    function() {
  if (!this.effectBeingShown_) {
    this.effectManager_ = null;
    this.analyser_ = null;
    this.effect_.noteChangeInHighlightState(false);
    this.effect_ = null;
  }
};
