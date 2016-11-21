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
goog.provide('audioCat.ui.project.TitleManager');

goog.require('audioCat.state.command.ChangeProjectTitleCommand');
goog.require('audioCat.state.events');
goog.require('audioCat.ui.project.templates');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('soy');


/**
 * Updates and maintains the title in response to user actions.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.state.Project} project The audio project.
 * @param {!audioCat.utility.DomHelper} domHelper Interacts with the DOM.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages the
 *     history of commands, thus allowing for undoing and redoing.
 * @param {!audioCat.ui.keyboard.KeyboardManager} keyboardManager Manages
 *     keyboard shortcuts.
 * @constructor
 */
audioCat.ui.project.TitleManager = function(
    idGenerator,
    project,
    domHelper,
    commandManager,
    keyboardManager) {
  /**
   * Generates unique IDs.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  /**
   * The project.
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  /**
   * The previous stable name of the project.
   * @private {string}
   */
  this.previousStableTitle_ = project.getTitle();

  /**
   * The currently recorded title.
   * @private {string}
   */
  this.recordedTitle_ = project.getTitle();

  /**
   * Interacts with the DOM.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Manages the history of commands.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  /**
   * Manages keyboard shortcuts.
   * @private {!audioCat.ui.keyboard.KeyboardManager}
   */
  this.keyboardManager_ = keyboardManager;

  /**
   * Text input element for the title of the project.
   * @private {!Element}
   */
  this.textInput_ = /** @type {!Element} */ (soy.renderAsFragment(
      audioCat.ui.project.templates.projectTitle));
  domHelper.setTextContent(this.textInput_, project.getTitle());

  // Filter for illegal characters.
  var listenFunction = goog.events.listen;
  listenFunction(
      this.textInput_, goog.events.EventType.KEYDOWN, this.handleTitleKeyDown_,
      false, this);

  // Change the project's title when the user updates it.
  listenFunction(
      this.textInput_, goog.events.EventType.KEYUP,
      this.handleTitleUpdateWithInput_, false, this);
  listenFunction(
      this.textInput_, 'blur', this.handleTitleFocus_, false, this);
  listenFunction(
      this.textInput_, 'input', this.handleTitleUpdateWithInput_,
      false, this);
  listenFunction(
      this.textInput_, 'blur', this.handleTitleBlur_, false, this);

  // Listen for changes in the title.
  listenFunction(project, audioCat.state.events.PROJECT_TITLE_CHANGED,
      this.handleProjectTitleChange_, false, this);
};

/**
 * Handles changes in the title of the project.
 * @param {!audioCat.state.ProjectTitleChangedEvent} event The event associated
 *     with the change.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleProjectTitleChange_ =
    function(event) {
  var newTitle =
      /** @type {!audioCat.state.Project} */ (event.target).getTitle();
  if (this.recordedTitle_ != newTitle) {
    // Only change the displayed title if it differs from what's recorded.
    this.setInputContent_(newTitle);
  }
  if (event.stable) {
    // Flash the background to indicate a change in title.
    var savingBackgroundStateClass = goog.getCssName('savingBackgroundState');
    goog.global.setTimeout(goog.bind(function() {
      goog.dom.classes.add(this.textInput_, savingBackgroundStateClass);
      goog.global.setTimeout(goog.bind(function() {
        goog.dom.classes.remove(this.textInput_, savingBackgroundStateClass);
      }, this), 300);
    }, this), 5);
  }
};

/**
 * Renders the title displayer.
 * @param {!Element} container The container in which to render the title.
 */
audioCat.ui.project.TitleManager.prototype.render = function(container) {
  this.domHelper_.removeChildren(container);
  this.domHelper_.appendChild(container, this.textInput_);
};

/**
 * Filters for illegal characters
 * @param {!goog.events.Event} e The associated event.
 * @return {boolean} Whether key just pressed should manifest its default
 *     action.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleKeyDown_ = function(e) {
  switch (e.keyCode) {
    case 13:
      // Enter was pressed. Focus out of the editable content.
      e.preventDefault();

      // Directly blurring the text instead of using this setTimeout fails to
      // block new lines for some odd reason.
      var textInput = this.textInput_;
      setTimeout(function() {
        textInput.blur();
      }, 0);
      return false;
  }
  return true;
};

/**
 * Responds to a change event in the title, which indicates a stable change in
 * the project name
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleUpdateWithChange_ =
    function() {
  this.handleTitleChangeHappening_();
};

/**
 * Handles a change that changes the title in some way.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleChangeHappening_ =
    function() {
  // Update the title as usual.
  this.handleTitleUpdate_(true);
  // Make the change undoable.
  var newTitle = this.project_.getTitle();
  if (this.previousStableTitle_ != newTitle) {
    // Make the change in project title undo-able.
    // However, suppress the command manager from running the command and thus
    // changing the project title since we had already done so (the true
    // boolean argument does the suppression).
    this.commandManager_.enqueueCommand(
        new audioCat.state.command.ChangeProjectTitleCommand(
            this.previousStableTitle_, newTitle, this.idGenerator_),
        true);
    this.previousStableTitle_ = newTitle;
  }
};

/**
 * Handles what happens when the title widget becomes in focus.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleFocus_ = function() {
  // Disable certain shortcuts while typing.
  this.keyboardManager_.setTypingState(true);
};

/**
 * Handles what happens when the title widget becomes out of focus.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleBlur_ = function() {
  // Re-enable certain shortcuts while typing.
  this.keyboardManager_.setTypingState(false);
  this.handleTitleChangeHappening_();
};

/**
 * Responds to an input event into the text input containing the title.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleUpdateWithInput_ =
    function() {
  this.handleTitleUpdate_();
};

/**
 * Updates the project title based on the UI interface.
 * @param {boolean=} opt_stableChange Whether the change is stable and thus
 *     marks a long-term, not a transient, change.
 * @return {boolean} Whether to accept the title update. If false, then the
 *     browser suppresses the default action of allowing the input.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.handleTitleUpdate_ = function(
    opt_stableChange) {
  // The DOM Helper lacks access to raw content.
  var titleContent = goog.dom.getRawTextContent(this.textInput_);

  // Bar new lines from the project title.
  var refinedContent = titleContent.replace(/(\r\n|\r|\n)+/g, '');
  if (titleContent != refinedContent) {
    this.setInputContent_(refinedContent);
    return false;
  }
  this.project_.setTitle(refinedContent, opt_stableChange);
  return true;
};

/**
 * Sets the text content of the text input and does no filtering before doing
 * so.
 * @param {string} content The content to set the input to.
 * @private
 */
audioCat.ui.project.TitleManager.prototype.setInputContent_ =
    function(content) {
  this.domHelper_.setTextContent(this.textInput_, content);
  this.recordedTitle_ = content;
};
