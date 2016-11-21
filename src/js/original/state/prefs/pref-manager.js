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
goog.provide('audioCat.state.prefs.PrefManager');

goog.require('audioCat.audio.BooleanConstant');
goog.require('audioCat.persistence.LocalStorageNamespace');
goog.require('audioCat.persistence.keys.UserPref');
goog.require('audioCat.state.prefs.Event');
goog.require('audioCat.state.prefs.StringConstant');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom');
goog.require('goog.events');


/**
 * Manages user preferences.
 * @param {!audioCat.persistence.LocalStorageManager} localStorageManager
 *     Manages local storage.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.prefs.PrefManager = function(localStorageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.persistence.LocalStorageManager}
   */
  this.localStorageManager_ = localStorageManager;

  /**
   * Whether to play while recording.
   * @private {boolean}
   */
  this.playWhileRecording_ =
      audioCat.audio.BooleanConstant.DEFAULT_PLAY_WHILE_RECORDING;

  /**
   * Whether to place the new section of audio after recording at the start of
   * the project instead of the current play time.
   * @private {boolean}
   */
  this.placeNewRecordingAtBeginning_ =
      audioCat.audio.BooleanConstant.DEFAULT_PLACE_NEW_RECORDING_AT_BEGINNING;

  /**
   * The number of channels to record with.
   * @private {number}
   */
  this.channelsForRecording_ =
      audioCat.audio.Constant.DEFAULT_INPUT_CHANNEL_COUNT;

  /**
   * Whether scrolling happens while playing.
   * @private {boolean}
   */
  this.scrollWhilePlayingEnabled_ =
      audioCat.audio.BooleanConstant.DEFAULT_SCROLL_WHILE_PLAYING_ENABLED;

  /**
   * Whether MP3 exporting is enabled for the user. Always true.
   * @private {boolean}
   */
  this.mp3ExportingEnabled_ = true;

  // When local storage changes in another tab, change settings as necessary.
  // TODO(chizeng): Possibly remove?
  goog.events.listen(goog.dom.getWindow(),
      'storage', this.setFromLocalStorage, false, this);
};
goog.inherits(audioCat.state.prefs.PrefManager, audioCat.utility.EventTarget);

/**
 * Sets a local storage setting within the user pref namespace.
 * @param {audioCat.persistence.keys.UserPref} key The key for the pref.
 * @param {string} value The value for the pref.
 * @private
 */
audioCat.state.prefs.PrefManager.prototype.setLocalStorageValue_ = function(
    key, value) {
  this.localStorageManager_.setForNamespace(
      audioCat.persistence.LocalStorageNamespace.USER_PREF, key, value);
};

/**
 * Gets a local storage setting within the user pref namespace.
 * @param {audioCat.persistence.keys.UserPref} key The key for the pref.
 * @return {?string} value The value for the pref. Null if non-existent.
 * @private
 */
audioCat.state.prefs.PrefManager.prototype.getLocalStorageValue_ = function(
    key) {
  return this.localStorageManager_.getFromNamespace(
      audioCat.persistence.LocalStorageNamespace.USER_PREF, key);
};

/**
 * Removes a local storage setting within the user pref namespace.
 * @param {audioCat.persistence.keys.UserPref} key The key for the pref.
 * @private
 */
audioCat.state.prefs.PrefManager.prototype.removeLocalStorageValue_ = function(
    key) {
  this.localStorageManager_.removeFromNamespace(
      audioCat.persistence.LocalStorageNamespace.USER_PREF, key);
};

/**
 * Initializes the values of the pref manager based on what's in local storage
 * now.
 */
audioCat.state.prefs.PrefManager.prototype.setFromLocalStorage = function() {
  // {@code true} suppresses local storage changes. They're not necessary since
  // we're, well, reading from local storage right now.
  var localStorageMp3EnabledValue = !!this.getLocalStorageValue_(
      audioCat.persistence.keys.UserPref.MP3_EXPORT_ENABLED);
  // If no local storage mp3 setting found, defer to default value.
  this.setMp3ExportingEnabled(localStorageMp3EnabledValue ||
      !!audioCat.state.prefs.StringConstant.MP3_ENABLED_DEFAULT_VALUE,
    true);

  // Set whether to scroll while playing.
  var localStorageScrollWhilePlayingValue = this.getLocalStorageValue_(
      audioCat.persistence.keys.UserPref.SCROLL_WHILE_PLAYING_ENABLED);
  var booleanValue =
      audioCat.audio.BooleanConstant.DEFAULT_SCROLL_WHILE_PLAYING_ENABLED;
  if (localStorageScrollWhilePlayingValue == '1') {
    booleanValue = true;
  } else if (localStorageScrollWhilePlayingValue == '0') {
    booleanValue = false;
  }
  this.setScrollWhilePlayingEnabled(booleanValue, true);
};

/**
 * @param {boolean} playWhileRecording
 */
audioCat.state.prefs.PrefManager.prototype.setPlayWhileRecording = function(
    playWhileRecording) {
  this.playWhileRecording_ = playWhileRecording;
};

/**
 * @return {boolean}
 */
audioCat.state.prefs.PrefManager.prototype.getPlayWhileRecording = function() {
  return this.playWhileRecording_;
};

/**
 * Sets whether scrolling should happen while playing.
 * @param {boolean} scrollWhilePlayingEnabled
 * @param {boolean=} opt_suppressLocalStorageChange Whether to suppress changes
 *     to local storage. Defaults to false, so local storage will change.
 */
audioCat.state.prefs.PrefManager.prototype.setScrollWhilePlayingEnabled =
    function(scrollWhilePlayingEnabled, opt_suppressLocalStorageChange) {
  if (this.scrollWhilePlayingEnabled_ != scrollWhilePlayingEnabled) {
    this.scrollWhilePlayingEnabled_ = scrollWhilePlayingEnabled;
    if (!opt_suppressLocalStorageChange) {
      this.setLocalStorageValue_(
            audioCat.persistence.keys.UserPref.SCROLL_WHILE_PLAYING_ENABLED,
            scrollWhilePlayingEnabled ? '1' : '0');
    }
    this.dispatchEvent(
        audioCat.state.prefs.Event.SCROLL_WHILE_PLAYING_ENABLED_CHANGED);
  }
};

/**
 * @return {boolean}
 */
audioCat.state.prefs.PrefManager.prototype.getScrollWhilePlayingEnabled =
    function() {
  return this.scrollWhilePlayingEnabled_;
};

/**
 * @param {boolean} placeNewRecordingAtBeginning
 */
audioCat.state.prefs.PrefManager.prototype.setPlaceNewRecordingAtBeginning =
    function(placeNewRecordingAtBeginning) {
  this.placeNewRecordingAtBeginning_ = placeNewRecordingAtBeginning;
};

/**
 * @return {boolean}
 */
audioCat.state.prefs.PrefManager.prototype.getPlaceNewRecordingAtBeginning =
    function() {
  return this.placeNewRecordingAtBeginning_;
};

/**
 * @param {number} channelsForRecording
 */
audioCat.state.prefs.PrefManager.prototype.setChannelsForRecording =
    function(channelsForRecording) {
  this.channelsForRecording_ = channelsForRecording;
};

/**
 * @return {number}
 */
audioCat.state.prefs.PrefManager.prototype.getChannelsForRecording =
    function() {
  return this.channelsForRecording_;
};

/**
 * Sets whether mp3 exporting is enabled and possibly the local storage value
 * too.
 * @param {boolean} mp3ExportingEnabled
 * @param {boolean=} opt_suppressLocalStorageChange Whether to suppress changes
 *     to local storage. Defaults to false, so local storage will change.
 */
audioCat.state.prefs.PrefManager.prototype.setMp3ExportingEnabled =
    function(mp3ExportingEnabled, opt_suppressLocalStorageChange) {
  if (this.mp3ExportingEnabled_ != mp3ExportingEnabled) {
    this.mp3ExportingEnabled_ = mp3ExportingEnabled;
    if (!opt_suppressLocalStorageChange) {
      if (mp3ExportingEnabled) {
        this.setLocalStorageValue_(
            audioCat.persistence.keys.UserPref.MP3_EXPORT_ENABLED,
            '' + goog.now());
      } else {
        // Otherwise, if no setting, just use the default MP3 enabled value.
        this.setLocalStorageValue_(
            audioCat.persistence.keys.UserPref.MP3_EXPORT_ENABLED,
            audioCat.state.prefs.StringConstant.MP3_ENABLED_DEFAULT_VALUE);
      }
    }
    this.dispatchEvent(audioCat.state.prefs.Event.MP3_EXPORT_ENABLED_CHANGED);
  }
};

/**
 * @return {boolean}
 */
audioCat.state.prefs.PrefManager.prototype.getMp3ExportingEnabled =
    function() {
  return this.mp3ExportingEnabled_;
};

