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
goog.provide('audioCat.ui.widget.DefaultRecordTimerWidget');

goog.require('audioCat.audio.record.Event');
goog.require('audioCat.ui.widget.EventType');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.async.AnimationDelay');
goog.require('goog.events');


/**
 * Displays the recording (with default recording device) time to the user.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.widget.PlayWidgetRecordManager} playWidgetRecordManager
 *     Manages the starting and stopping of default recording.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.DefaultRecordTimerWidget =
    function(domHelper, playWidgetRecordManager, timeFormatter) {
  /**
   * Facilitates DOM interactions,
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  var container = domHelper.createElement('div');
  goog.dom.classes.add(container, goog.getCssName('recordingTimeDisplayText'));
  goog.base(this, container);

  /**
   * Formats time.
   * @private {!audioCat.ui.text.TimeFormatter}
   */
  this.timeFormatter_ = timeFormatter;

  /**
   * The current recording process, if any.
   * @private {audioCat.audio.record.RecordingJob}
   */
  this.recordingJob_ = null;

  /**
   * The animation delay pegged to frame times. Used to update the displayed
   * recording time. Null when not in the process of recording.
   * @private {goog.async.AnimationDelay}
   */
  this.playAnimationDelay_ = null;

  // In the beginning, set the display to 0.
  this.reset_();

  goog.events.listen(playWidgetRecordManager,
      audioCat.ui.widget.EventType.DEFAULT_RECORDING_STARTED,
      this.handleDefaultRecordingStarted_, false, this);
  goog.events.listen(playWidgetRecordManager,
      audioCat.ui.widget.EventType.DEFAULT_RECORDING_STOPPED,
      this.handleDefaultRecordingStopped_, false, this);
};
goog.inherits(audioCat.ui.widget.DefaultRecordTimerWidget,
    audioCat.ui.widget.Widget);

/**
 * Resets the display time.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.reset_ = function() {
  this.setDisplayTime_(0);
};

/**
 * Sets the currently displayed time into recording.
 * @param {number} currentTimeInSeconds That value in seconds.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.setDisplayTime_ =
    function(currentTimeInSeconds) {
  var formattedTime = this.timeFormatter_.formatTime(currentTimeInSeconds);
  this.domHelper_.setTextContent(this.getDom(), formattedTime);
};

/**
 * Notifies the widget that default recording has begun.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.
    handleDefaultRecordingStarted_ =
    function(event) {
  var manager = /** @type {!audioCat.ui.widget.PlayWidgetRecordManager} */ (
    event.target);
  this.recordingJob_ = /** @type {!audioCat.audio.record.RecordingJob} */ (
      manager.getCurrentRecordingJob());
  this.playLoop_();
};

/**
 * Notifies the widget that default recording has stopped.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.
    handleDefaultRecordingStopped_ =
    function(event) {
  this.playAnimationDelay_.stop();
  this.playAnimationDelay_ = null;
};

/**
 * Enters the animation loop while playing.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.playLoop_ = function() {
  var animationDelay = new goog.async.AnimationDelay(
      this.updateOnEachFrame_, undefined, this);
  animationDelay.start();
  this.playAnimationDelay_ = animationDelay;
};

/**
 * Does operations for each frame while playing.
 * @private
 */
audioCat.ui.widget.DefaultRecordTimerWidget.prototype.updateOnEachFrame_ =
    function() {
  this.setDisplayTime_(this.recordingJob_.computeTimeIntoRecording());
  this.playLoop_();
};
