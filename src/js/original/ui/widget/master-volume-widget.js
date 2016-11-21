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
goog.provide('audioCat.ui.widget.MasterVolumeWidget');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.audio.EventType');
goog.require('audioCat.state.command.AlterMasterVolumeCommand');
goog.require('audioCat.ui.widget.SliderWidget');
goog.require('audioCat.utility.Unit');
goog.require('goog.events');


/**
 * Controls the master volume.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.audio.AudioGraph} audioGraph Hooks up audio components.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between different units of audio and various audio standards.
 * @constructor
 * @extends {audioCat.ui.widget.SliderWidget}
 */
audioCat.ui.widget.MasterVolumeWidget = function(
    domHelper,
    audioGraph,
    commandManager,
    dialogManager,
    audioUnitConverter) {
  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  var stableGain = 0; // In decibels, 0 dB is default (no change).
  var minGain = audioCat.audio.Constant.MIN_VOLUME_DECIBELS;
  var maxGain = audioCat.audio.Constant.MAX_VOLUME_DECIBELS;
  goog.base(this,
      domHelper,
      goog.getCssName('masterVolumeWidgetContainer'),
      'Master ' + audioCat.utility.Unit.DB + ' Gain',
      String(minGain),
      String(maxGain),
      1, // Round to 2 decimal places for display purposes.
      100000,
      minGain,
      maxGain,
      stableGain, // The initial gain.
      audioCat.audio.Constant.DEFAULT_VOLUME_DECIBELS,
      dialogManager);

  // Change the master gain as the slider shifts live.
  this.performAsSliderShifts(function(stateValue) {
    audioGraph.setMasterGain(
        audioUnitConverter.convertDecibelToSample(stateValue));
  });

  // Issue an undo/redo-able command when the user stably changes the volume.
  this.performOnStableConfiguration(function(stateValue) {
    if (stateValue == stableGain) {
      return;
    }
    commandManager.enqueueCommand(
        new audioCat.state.command.AlterMasterVolumeCommand(
            audioGraph,
            audioUnitConverter.convertDecibelToSample(stableGain),
            audioUnitConverter.convertDecibelToSample(stateValue)));
    stableGain = stateValue;
  });

  // Change the slider as the master volume changes live.
  goog.events.listen(audioGraph,
      audioCat.audio.EventType.MASTER_GAIN_CHANGED,
          this.handleMasterVolumeChanged_, false, this);
};
goog.inherits(
    audioCat.ui.widget.MasterVolumeWidget, audioCat.ui.widget.SliderWidget);


/**
 * Handles changes in master volume. Changes the slider when the master volume
 * changes live.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.MasterVolumeWidget.prototype.handleMasterVolumeChanged_ =
    function(event) {
  var sampleValueMasterGain =
      /** @type {!audioCat.audio.AudioGraph} */ (event.target).getMasterGain();
  this.setStateValue(
      this.audioUnitConverter_.convertSampleToDecibel(sampleValueMasterGain));
};
