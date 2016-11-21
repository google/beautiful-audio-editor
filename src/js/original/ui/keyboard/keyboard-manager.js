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
goog.provide('audioCat.ui.keyboard.KeyboardManager');

goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.ui.KeyboardShortcutHandler.EventType');

/**
 * Manages keyboard interactions.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!Element} target The target from which to capture keyboard
 *     interactions.
 * @constructor
 */
audioCat.ui.keyboard.KeyboardManager = function(
    idGenerator,
    actionManager,
    target) {
  /**
   * Mapping from shortcut ID to action to do.
   * @private {!Object<string, audioCat.action.Action>}
   */
  this.shortcuts_ = {};

  /**
   * Mapping from ID of shortcut to be disabled upon typing to action to do.
   * @private {!Object<string, audioCat.action.Action>}
   */
  this.typingShortcuts_ = {};

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Whether we believe the user is currently typing, in which case we should
   * ignore certain shortcuts.
   * @private {boolean}
   */
  this.typingState_ = false;

  /**
   * Handles keyboard shortcuts.
   * @private {!goog.ui.KeyboardShortcutHandler}
   */
  this.keyboardShortcutHandler_ = new goog.ui.KeyboardShortcutHandler(target);
  this.keyboardShortcutHandler_.unregisterAll();
  this.keyboardShortcutHandler_.listen(
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      this.handleNativeShortCutTriggered_, false, this);

  // Register some shortcuts.

  // Record / stop recording.
  this.registerShortcut('ctrl+r', actionManager.retrieveAction(
      audioCat.action.ActionType.TOGGLE_DEFAULT_RECORDING));
  this.registerShortcut('meta+r', actionManager.retrieveAction(
      audioCat.action.ActionType.TOGGLE_DEFAULT_RECORDING));

  // Undo and redo.
  this.registerShortcut('ctrl+y', actionManager.retrieveAction(
      audioCat.action.ActionType.REDO));
  this.registerShortcut('meta+y', actionManager.retrieveAction(
      audioCat.action.ActionType.REDO));
  this.registerShortcut('ctrl+z', actionManager.retrieveAction(
      audioCat.action.ActionType.UNDO));
  this.registerShortcut('meta+z', actionManager.retrieveAction(
      audioCat.action.ActionType.UNDO));

  // Play or pause.
  this.registerShortcut('space', actionManager.retrieveAction(
      audioCat.action.ActionType.PLAY_PAUSE), true);

  // Zoom.
  this.registerShortcut('meta+1', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_OUT));
  this.registerShortcut('ctrl+1', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_OUT));
  this.registerShortcut('meta+2', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_IN));
  this.registerShortcut('ctrl+2', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_IN));
  this.registerShortcut('meta+0', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_TO_DEFAULT));
  this.registerShortcut('ctrl+0', actionManager.retrieveAction(
      audioCat.action.ActionType.ZOOM_TO_DEFAULT));
};

/**
 * Registers a shortcut.
 * @param {string} keys A string denoting the keys to press. See comments for
 *     goog.ui.KeyboardShortcutHandler.prototype.registerShortcut for format.
 * @param {!audioCat.action.Action} action The action to perform upon those keys
 *     being pressed.
 * @param {boolean=} opt_isTypingShortcut Whether this shortcut should be
 *     disabled upon typing.
 */
audioCat.ui.keyboard.KeyboardManager.prototype.registerShortcut = function(
    keys,
    action,
    opt_isTypingShortcut) {
  var shortcutId = '' + this.idGenerator_.obtainUniqueId();
  this.shortcuts_[shortcutId] = action;
  if (opt_isTypingShortcut) {
    this.typingShortcuts_[shortcutId] = action;
  }
  this.keyboardShortcutHandler_.registerShortcut(shortcutId, keys);
};

/**
 * Sets whether we're currently typing or not.
 * @param {boolean} currentlyTyping Whether we're currently typing.
 */
audioCat.ui.keyboard.KeyboardManager.prototype.setTypingState = function(
    currentlyTyping) {
  this.typingState_ = currentlyTyping;
};

/**
 * Handles what happens if a native shortcut is triggered.
 * @param {!goog.ui.KeyboardShortcutEvent} event The associated event.
 * @return {boolean} Whether this triggering should not continue to propagate
 *     the event.
 * @private
 */
audioCat.ui.keyboard.KeyboardManager.prototype.handleNativeShortCutTriggered_ =
    function(event) {
  var shortcutId = event.identifier;
  var action = this.shortcuts_[shortcutId];
  if (action && !(this.typingState_ && this.typingShortcuts_[shortcutId])) {
    action.doAction();
    return false;
  }
  return true;
};
