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
goog.provide('audioCat.ui.widget.TempoSliderWidget');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.EventType');
goog.require('audioCat.state.command.AlterTempoCommand');
goog.require('audioCat.ui.widget.SliderWidget');
goog.require('goog.events');


/**
 * A slider that controls the tempo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.audio.SignatureTempoManager} signatureTempoManager Manages
 *     the current time signature and tempo.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.ui.widget.SliderWidget}
 */
audioCat.ui.widget.TempoSliderWidget = function(
    idGenerator,
    domHelper,
    signatureTempoManager,
    commandManager,
    dialogManager) {
  var stableTempo = signatureTempoManager.getTempo();
  var defaultTempo = audioCat.audio.Constant.DEFAULT_TEMPO;
  var minTempo = signatureTempoManager.getMinTempo();
  var maxTempo = signatureTempoManager.getMaxTempo();
  goog.base(this,
      domHelper,
      goog.getCssName('masterVolumeWidgetContainer'),
      'Grid Tempo',
      String(minTempo),
      String(maxTempo),
      0, // Round to 0 decimal places for display purposes.
      12000,
      minTempo,
      maxTempo,
      stableTempo, // The initial tempo.
      defaultTempo,
      dialogManager);

  // Alter the tempo as the slider changes.
  this.performAsSliderShifts(function(stateValue) {
    signatureTempoManager.setTempo(stateValue);
  });

  // Issue an undo/redo-able command when the user stably changes the tempo.
  this.performOnStableConfiguration(function(stateValue) {
    if (stateValue == stableTempo) {
      return;
    }
    commandManager.enqueueCommand(new audioCat.state.command.AlterTempoCommand(
        signatureTempoManager, stableTempo, stateValue, idGenerator));
    stableTempo = stateValue;
  });

  /**
   * Key for the listener that updates the slider as the tempo changes.
   * @private {goog.events.Key}
   */
  this.tempoChangeListenerKey_ = goog.events.listen(
      signatureTempoManager,
      audioCat.audio.EventType.TEMPO_CHANGED,
      this.handleTempoChanged_,
      false,
      this);
};
goog.inherits(
    audioCat.ui.widget.TempoSliderWidget, audioCat.ui.widget.SliderWidget);

/**
 * Handles what happens when the tempo changes. Updates the slider.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.TempoSliderWidget.prototype.handleTempoChanged_ =
    function(event) {
  this.setStateValue(/** @type {!audioCat.audio.SignatureTempoManager} */ (
      event.target).getTempo());
};

/** @override */
audioCat.ui.widget.TempoSliderWidget.prototype.cleanUp = function() {
  goog.base(this, 'cleanUp');
  goog.events.unlistenByKey(this.tempoChangeListenerKey_);
};
