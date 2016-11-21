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
goog.provide('audioCat.ui.tracks.TrackVolumeSlider');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.command.AlterTrackVolumeDecibelsCommand');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.widget.SliderWidget');
goog.require('audioCat.utility.Unit');
goog.require('goog.events');


/**
 * A slider for controlling the volume of a track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.Track} track The track this slider is relevant to.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands and command history.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between different units and standards of audio.
 * @constructor
 * @extends {audioCat.ui.widget.SliderWidget}
 */
audioCat.ui.tracks.TrackVolumeSlider = function(
      idGenerator,
      domHelper,
      track,
      commandManager,
      dialogManager,
      audioUnitConverter) {
  var stableGain = track.getGainInDecibels(); // The current stable gain value.

  // Don't go under the min decibel value:
  var minGain = audioCat.audio.Constant.MIN_VOLUME_DECIBELS;
  if (stableGain < minGain) {
    stableGain = minGain;
  }

  var maxGain = audioCat.audio.Constant.MAX_VOLUME_DECIBELS;
  var defaultGain = audioCat.audio.Constant.DEFAULT_VOLUME_DECIBELS;
  goog.base(this,
      domHelper,
      goog.getCssName('trackDescriptorVolumeSliderContainer'),
      audioCat.utility.Unit.DB + ' Gain',
      String(minGain), // The left label.
      String(maxGain), // The right label.
      1, // Round to this many decimal places.
      100000, // Offer this many stopping points on the slider for fine control.
      minGain,
      maxGain,
      stableGain, // The initial value.
      defaultGain, // The default value that the user can reset to.
      dialogManager);

  // Change the gain live as the user interacts with the slider.
  this.performAsSliderShifts(function(stateValue) {
    track.setGain(audioUnitConverter.convertDecibelToSample(stateValue));
  });

  // Once the user settles on a stable value, issue a command.
  this.performOnStableConfiguration(function(stateValue) {
    commandManager.enqueueCommand(
      new audioCat.state.command.AlterTrackVolumeDecibelsCommand(
          track, stableGain, stateValue, idGenerator));
    stableGain = stateValue;
  });

  // TODO(chizeng): Remove this listener when this widget gets cleaned up.
  // The slider should respond to changes in state.
  goog.events.listen(track, audioCat.state.events.TRACK_VOLUME_CHANGED,
      function() {
      this.setStateValue(track.getGainInDecibels());
  }, false, this);
  goog.events.listen(track, audioCat.state.events.TRACK_STABLE_VOLUME_CHANGED,
      function() {
      stableGain = audioUnitConverter.convertSampleToDecibel(track.getGain());
  }, false, this);
};
goog.inherits(
    audioCat.ui.tracks.TrackVolumeSlider, audioCat.ui.widget.SliderWidget);
