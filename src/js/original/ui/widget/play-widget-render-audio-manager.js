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
goog.provide('audioCat.ui.widget.PlayWidgetRenderAudioManager');

goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.state.command.RenderAudioToNewTrackCommand');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Manages a UI element for rendering audio into a new track.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio
 *     into a buffer.
 * @param {!audioCat.action.RenderAudioAction} renderAudioAction The action that
 *     renders the audio.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands and thus allows for undo/redo.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!Element} container The container for the element.
 * @constructor
 * @struct
 */
audioCat.ui.widget.PlayWidgetRenderAudioManager = function(
    domHelper,
    idGenerator,
    audioRenderer,
    renderAudioAction,
    commandManager,
    memoryManager,
    container) {
  /**
   * Facilitates DOM interactions.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Generates IDs unique throughout the application.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * Renders the audio of the project into a single audio buffer.
   * @private {!audioCat.audio.render.AudioRenderer}
   */
  this.audioRenderer_ = audioRenderer;

  /**
   * The action for rendering audio.
   * @private {!audioCat.action.RenderAudioAction}
   */
  this.renderAudioAction_ = renderAudioAction;

  /**
   * The container for the element. May be clicked on and interacted with.
   * @private {!Element}
   */
  this.container_ = container;

  /**
   * Manages the history of commands and thus allows for undo/redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.state.MemoryManager}
   */
  this.memoryManager_ = memoryManager;

  var initialEnabledState = true;
  /**
   * Whether this item is enabled.
   * @private {boolean}
   */
  this.enabled_ = initialEnabledState;
  this.setEnabledState_(initialEnabledState);
};

/**
 * Handles what happens when the user lifts the cursor from the button.
 * @private
 */
audioCat.ui.widget.PlayWidgetRenderAudioManager.prototype.handleUpPress_ =
    function() {
  // Do not enable rendering into a track again until this is done.
  this.setEnabledState_(false);

  var audioRenderer = this.audioRenderer_;
  var listenerKey = goog.events.listenOnce(audioRenderer,
        audioCat.audio.render.EventType.AUDIO_RENDERED,
        this.handleRenderingDone_, false, this);

  try {
    this.renderAudioAction_.doAction();
  } catch (err) {
    goog.events.unlistenByKey(listenerKey);

    // This rendering failed, but allow future renderings obviously.
    this.setEnabledState_(true);
  }
};

/**
 * Handles what happens when rendering audio is done.
 * @param {!audioCat.audio.render.AudioRenderedEvent} event The event dispatched
 *     when rendering audio is completes, whether successfully or abortively.
 * @private
 */
audioCat.ui.widget.PlayWidgetRenderAudioManager.prototype.handleRenderingDone_ =
    function(event) {
  var audioBuffer = event.getAudioBuffer();
  if (!audioBuffer) {
    // TODO(chizeng): Handle the erring case of no audio buffer.
    throw 1;
  }
  var audioChest = new audioCat.audio.AudioChest(
      audioBuffer,
      'Rendered audio.',
      audioCat.audio.AudioOrigination.RENDERED,
      this.idGenerator_);
  var command = new audioCat.state.command.RenderAudioToNewTrackCommand(
      this.idGenerator_, audioChest);
  this.commandManager_.enqueueCommand(command);
  // Note the memory we just added.
  // this.memoryManager_.addBytes(command.getMemoryAdded());

  // We've finished rendering. Now, we can render again if we'd like.
  this.setEnabledState_(true);
};

/**
 * Sets whether this item is enabled.
 * @param {boolean} enabledState Whether this item is enabled.
 * @private
 */
audioCat.ui.widget.PlayWidgetRenderAudioManager.prototype.setEnabledState_ =
    function(enabledState) {
  this.enabled_ = enabledState;
  var container = this.container_;
  var domHelper = this.domHelper_;
  if (enabledState) {
    goog.dom.classes.add(container, goog.getCssName('.enabledWidgetButton'));
    goog.dom.classes.remove(
        container, goog.getCssName('.disabledWidgetButton'));
    domHelper.listenForUpPress(container, this.handleUpPress_, false, this);
  } else {
    goog.dom.classes.add(container, goog.getCssName('.disabledWidgetButton'));
    goog.dom.classes.remove(container, goog.getCssName('.enabledWidgetButton'));
    domHelper.unlistenForUpPress(container, this.handleUpPress_, false, this);
  }
};
