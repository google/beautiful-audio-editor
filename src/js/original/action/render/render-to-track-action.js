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
goog.provide('audioCat.action.render.RenderToTrackAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.audio.AudioChest');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.audio.render.EventType');
goog.require('audioCat.state.command.RenderAudioToNewTrackCommand');
goog.require('audioCat.ui.message.MessageType');
goog.require('goog.events');


/**
 * Renders project audio to a track.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands. And thus allows for undo/redo.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout this single-threaded application.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.action.RenderAudioAction} renderAudioAction An action that
 *     renders audio into a buffer.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.render.RenderToTrackAction = function(
    audioRenderer,
    commandManager,
    idGenerator,
    messageManager,
    memoryManager,
    renderAudioAction) {
  goog.base(this);

  /**
   * Renders audio to a buffer.
   * @private {!audioCat.audio.render.AudioRenderer}
   */
  this.audioRenderer_ = audioRenderer;

  /**
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * @private {!audioCat.state.MemoryManager}
   */
  this.memoryManager_ = memoryManager;

  /**
   * @private {!audioCat.action.RenderAudioAction}
   */
  this.renderAudioAction_ = renderAudioAction;
};
goog.inherits(
    audioCat.action.render.RenderToTrackAction, audioCat.action.Action);

/** @override */
audioCat.action.render.RenderToTrackAction.prototype.doAction = function() {
  var audioRenderer = this.audioRenderer_;
  var renderOperationId = audioRenderer.getNextRenderId();
  var listenerKey = goog.events.listen(audioRenderer,
      audioCat.audio.render.EventType.AUDIO_RENDERED,
      function(event) {
        if (renderOperationId ==
            /** @type {!audioCat.audio.render.AudioRenderedEvent} */ (
                event).getRenderId()) {
          // The render operation ID matches the render operation we'd begun.
          goog.events.unlistenByKey(listenerKey);
          var audioBuffer = event.getAudioBuffer();
          if (!audioBuffer) {
            // TODO(chizeng): Handle the erring case of no audio buffer.
            this.messageManager_.issueMessage(
                'Rendering failed, and it\'s our fault. ' +
                'Could you please contact us, and describe what happened? ' +
                'Thank you! And thank you we will.',
                audioCat.ui.message.MessageType.DANGER);
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
          this.messageManager_.issueMessage(
              'Successfully rendered project to new track.',
              audioCat.ui.message.MessageType.SUCCESS);
        }
      }, false, this);

  // Do the rendering.
  try {
    this.renderAudioAction_.doAction();
    this.messageManager_.issueMessage('Rendering project to new track ...');
  } catch (err) {
    goog.events.unlistenByKey(listenerKey);
    this.messageManager_.issueMessage(
        'Rendering failed.',
        audioCat.ui.message.MessageType.DANGER);
    throw err;
  }
};
