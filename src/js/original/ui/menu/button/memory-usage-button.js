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
goog.provide('audioCat.ui.menu.button.MemoryUsageButton');

goog.require('audioCat.action.ActionType');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('audioCat.ui.menu.Menu');
goog.require('audioCat.ui.menu.button.MenuButton');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component.EventType');
goog.require('goog.window');


/**
 * A button for managing memory.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.state.MemoryManager} memoryManager Manages memory.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playing of
 *     project sound.
 * @param {!audioCat.state.command.CommandManager} commandManager Executes and
 *     manages commands.
 * @constructor
 * @extends {audioCat.ui.menu.button.MenuButton}
 */
audioCat.ui.menu.button.MemoryUsageButton = function(
    domHelper,
    actionManager,
    memoryManager,
    dialogManager,
    playManager,
    commandManager) {
  var self = this;

  var totalMemory;
  var potentialShavedMemory;

  /**
   * @return {!Element} An element communicating how much memory we need.
   */
  var computeMemoryNeeded = function() {
    totalMemory = memoryManager.getBytesUsed();
    // Memory we could get if we just got rid of command history.
    potentialShavedMemory = memoryManager.obtainMinShavedSize();

    // If we're over some hundred MB, we're in dangerous territory.
    var haveDangerousMemory = potentialShavedMemory > 300e6;

    var content = 'Manage Memory: ';
    if (haveDangerousMemory) {
      content += '<span class="' + goog.getCssName('dangerousMemory') + '">';
    }
    content += Math.round(totalMemory / 1e6) + 'MB';
    if (haveDangerousMemory) {
      content += '</span>';
    }
    content += ' / ' + Math.round(potentialShavedMemory / 1e6) + 'MB';

    var contentSpan = domHelper.createElement('span');
    domHelper.setRawInnerHtml(contentSpan, content);
    return contentSpan;
  }

  audioCat.ui.menu.button.MemoryUsageButton.base(
      this, 'constructor', computeMemoryNeeded());

  // This makes getElement() return a non-null element.
  this.createDom();

  /**
   * The key for the listener that opens a new window for purchase.
   * @private {goog.events.Key}
   */
  this.clickKey_ =
      goog.events.listen(this.getElement(), 'click', function() {
    // TODO(chizeng): Move displaying this dialog into an action. 
    // Open dialog for memory management.
    var content = domHelper.createDiv();

    // Tell user how much memory he/she is using.
    var intro = domHelper.createDiv(goog.getCssName('innerParagraphContent'));
    var audioDataMessage = (totalMemory > 1e6) ?
        Math.round(totalMemory / 1e6) + ' MB' :
        Math.round(totalMemory / 1e3) + ' KB';
    domHelper.setRawInnerHtml(intro,
        'The editor is storing about <b>' + audioDataMessage +
        '</b> worth of audio data.');
    domHelper.appendChild(content, intro);

    // Tell the user how much memory he / she could save.
    var couldSaveMessage =
        domHelper.createDiv(goog.getCssName('innerParagraphContent'));
    audioDataMessage = (potentialShavedMemory > 1e6) ?
        Math.round(potentialShavedMemory / 1e6) + ' MB' :
        Math.round(potentialShavedMemory / 1e3) + ' KB';
    domHelper.setRawInnerHtml(couldSaveMessage,
        'If you cleared command history, your audio data will take up <b>' +
        audioDataMessage + '</b>, but you will not be able to undo or redo. ' +
        'Less memory decreases the chances of crashing and export failure. ' +
        'Also decrease the chance of crashing by decreasing the time length ' +
        'of your project.');
    domHelper.appendChild(content, couldSaveMessage);

    var bytesSaved = totalMemory - potentialShavedMemory;
    if (bytesSaved == 0) {
      // The user would save no bytes after clearing memory anyway ...
      var noteMessage =
          domHelper.createDiv(goog.getCssName('innerParagraphContent'));
      domHelper.setRawInnerHtml(noteMessage, 'Clearing history saves no ' +
          'memory now, so there is no need to do that at the moment.');
      domHelper.appendChild(content, noteMessage);
    } else if (bytesSaved < 25e6) {
      // The We don't actually save that much memory ...
      var noteMessage =
          domHelper.createDiv(goog.getCssName('innerParagraphContent'));
      audioDataMessage = (bytesSaved > 1e6) ?
          Math.round(bytesSaved / 1e6) + ' MB' :
          Math.round(bytesSaved / 1e3) + ' KB';
      domHelper.setRawInnerHtml(noteMessage,
          '<b>Note:</b> Clearing history might not be worth it. You only' +
          ' save ' + audioDataMessage + '.');
      domHelper.appendChild(content, noteMessage);
    }

    // Create the main dialog.
    var dialog = dialogManager.obtainDialog(
        content, audioCat.ui.dialog.DialogText.CLOSE);

    // Create a button.
    var clearButton;
    if (bytesSaved > 0) {
      // The user would actually save bytes after clearing memory, so let the
      // user do that.
      clearButton = dialogManager.obtainButton(
          'Clear command history. Save memory, but disable undos.');
      clearButton.performOnUpPress(function() {
        // Prevent double-clicks.
        clearButton.clearUpPressCallback();
        // Pause playing for good measure.
        if (playManager.getPlayState()) {
          playManager.pause();
        }
        // Tell the user that memory is being shaved.
        var shavingDialog = dialogManager.obtainDialog(
            'Clearing command history ...');
        dialogManager.showDialog(shavingDialog);
        // Obliterate command history ...
        commandManager.obliterateHistory();
        // Shave memory!!
        memoryManager.shaveApplicationState();
        // Hide both dialogs after finishing.
        dialogManager.hideDialog(shavingDialog);
        dialogManager.hideDialog(dialog);
      });
      domHelper.appendChild(content, clearButton.getDom());
    }

    // When the main dialog closes ...
    dialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
      // Put the button back.
      if (clearButton) {
        dialogManager.putBackButton(clearButton);
      }
    });
    goog.dom.classes.add(dialog.getDom(), goog.getCssName('topBufferedDialog'));
    dialogManager.showDialog(dialog);
  });

  /**
   * Listener for memory change key. When memory stats change, change the text.
   * @private {goog.events.Key}
   */
  this.memoryChangeKey_ = goog.events.listen(memoryManager,
      audioCat.state.events.MEMORY_CHANGED, function() {
    self.setContent(computeMemoryNeeded());
  });
};
goog.inherits(audioCat.ui.menu.button.MemoryUsageButton,
    audioCat.ui.menu.button.MenuButton);

/** @override */
audioCat.ui.menu.button.MemoryUsageButton.prototype.disposeInternal =
    function() {
  goog.events.unlistenByKey(this.memoryChangeKey_);
  goog.events.unlistenByKey(this.clickKey_);
  goog.base(this, 'disposeInternal');
};
