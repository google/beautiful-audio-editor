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
goog.provide('audioCat.ui.tracks.TrackPanSlider');

goog.require('audioCat.audio.Constant');
goog.require('audioCat.state.command.AlterTrackPanCommand');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.widget.SliderWidget');
goog.require('goog.events');


/**
 * A slider for controlling the panning of a track.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.state.Track} track The track this slider is relevant to.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     commands and command history.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.ui.widget.SliderWidget}
 */
audioCat.ui.tracks.TrackPanSlider = function(
      idGenerator, domHelper, track, commandManager, dialogManager) {
  var stablePan = track.getPanFromLeft(); // The current stable pan value.
  var defaultPan = audioCat.audio.Constant.DEFAULT_PAN_DEGREES;
  var minPan = audioCat.audio.Constant.MIN_PAN_DEGREES; // All the way left.
  var maxPan = audioCat.audio.Constant.MAX_PAN_DEGREES; // All the way right.
  goog.base(this,
      domHelper,
      goog.getCssName('trackDescriptorPanSliderContainer'),
      'Pan', // Main label for slider.
      'L', // Left label.
      'R', // Right label.
      2, // When displaying values, round to 2 decimal places.
      12001, // The slider resolution. Odd so 0 is a stable value.
      minPan,
      maxPan,
      stablePan, // The initial value.
      defaultPan, // The default value that the user can reset to.
      dialogManager);

  // Change the pan live as the user interacts with the slider.
  this.performAsSliderShifts(function(stateValue) {
    track.setPanFromLeft(stateValue);
  });

  // Once the user settles on a stable value, issue a command.
  this.performOnStableConfiguration(function(stateValue) {
    commandManager.enqueueCommand(
      new audioCat.state.command.AlterTrackPanCommand(
          track, stablePan, stateValue, idGenerator));
    stablePan = stateValue;
  });

  // TODO(chizeng): Remove these listeners when this widget gets cleaned up.
  // The slider should respond to changes in state.
  goog.events.listen(track, audioCat.state.events.TRACK_PAN_CHANGED,
      function() {
      this.setStateValue(track.getPanFromLeft());
  }, false, this);
  goog.events.listen(track, audioCat.state.events.TRACK_STABLE_PAN_CHANGED,
      function() {
      stablePan = track.getPanFromLeft();
  }, false, this);
};
goog.inherits(
    audioCat.ui.tracks.TrackPanSlider, audioCat.ui.widget.SliderWidget);
