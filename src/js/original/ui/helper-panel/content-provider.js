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
goog.provide('audioCat.ui.helperPanel.ContentProvider');

goog.require('audioCat.state.effect.field.GradientField');
goog.require('audioCat.ui.helperPanel.EventType');
goog.require('audioCat.ui.widget.field.GradientFieldSlider');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * Provides content to be displayed somewhere.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages play.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.helperPanel.ContentProvider = function(
    idGenerator,
    domHelper,
    playManager,
    commandManager,
    dialogManager,
    prefManager) {
  goog.base(this);

  /**
   * @protected {!audioCat.utility.IdGenerator}
   */
  this.idGenerator = idGenerator;

  /**
   * @protected {!audioCat.utility.DomHelper}
   */
  this.domHelper = domHelper;

  /**
   * @protected {!audioCat.audio.play.PlayManager}
   */
  this.playManager = playManager;

  /**
   * @protected {!audioCat.state.command.CommandManager}
   */
  this.commandManager = commandManager;

  /**
   * @protected {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager = dialogManager;

  /**
   * @protected {!audioCat.state.prefs.PrefManager}
   */
  this.prefManager = prefManager;

  /**
   * The current internals of the close button if there is one.
   * @private {Element}
   */
  this.closeButtonInner_ = null;

  /**
   * A list of various listener keys to unlisten while cleaning up content.
   * @protected {!Array.<goog.events.Key>}
   */
  this.listenKeys = [];

  /**
   * A list of widgets to clean up later.
   * @protected {!Array.<!audioCat.ui.widget.Widget>}
   */
  this.widgets = [];
};
goog.inherits(
    audioCat.ui.helperPanel.ContentProvider, audioCat.utility.EventTarget);

/**
 * Requests the helper panel manager to show this content provider.
 */
audioCat.ui.helperPanel.ContentProvider.prototype.requestShow = function() {
  this.dispatchEvent(audioCat.ui.helperPanel.EventType.SHOW);
};

/**
 * Requests the helper panel manager to hide this content provider.
 */
audioCat.ui.helperPanel.ContentProvider.prototype.requestHide = function() {
  this.dispatchEvent(audioCat.ui.helperPanel.EventType.HIDE);
};

/**
 * Retrieves content for display.
 * @return {!Element} The highest-level node for the content to display.
 */
audioCat.ui.helperPanel.ContentProvider.prototype.retrieveContent = function() {
  var domHelper = this.domHelper;
  var baseElement = domHelper.createDiv(goog.getCssName('contentContainer'));

  var closeButton = domHelper.createDiv(goog.getCssName('closeButton'));
  domHelper.appendChild(baseElement, closeButton);

  var closeButtonInner = domHelper.createDiv(
      goog.getCssName('closeButtonInner'));
  domHelper.setRawInnerHtml(closeButtonInner, 'close');
  domHelper.appendChild(closeButton, closeButtonInner);
  this.closeButtonInner_ = closeButtonInner;
  domHelper.listenForPress(closeButtonInner,
      this.handleCloseButtonPress_, false, this);
  domHelper.appendChild(baseElement, this.retrieveInnerContent());
  return baseElement;
};

/**
 * Creates widgets given a certain displayable entity such as a gradient field
 * or a string. Then, appends the created widget onto the given element. Stores
 * the created widget so that it can be cleaned up later.
 * @param {!Element} container The element to append the newly created widget
 *     on.
 * @param {!audioCat.ui.helperPanel.Type.Displayable} displayable The
 *     displayable entity to create widgets for.
 * @protected
 */
audioCat.ui.helperPanel.ContentProvider.prototype.addAndStoreWidgets =
    function(container, displayable) {
  var domHelper = this.domHelper;
  if (displayable instanceof audioCat.state.effect.field.GradientField) {
    // Add a description of the gradient field along with a slider.
    var displayableBaseElement = domHelper.createDiv(
        goog.getCssName('displayable'));
    // First, add the description string.
    var description = domHelper.createElement('p');
    goog.dom.classes.add(
        description, goog.getCssName('helperPanelAddendumText'));
    domHelper.setRawInnerHtml(description, displayable.getDescription());
    domHelper.appendChild(displayableBaseElement, description);
    // Then, add the slider.
    var slider = new audioCat.ui.widget.field.GradientFieldSlider(
        this.idGenerator,
        domHelper,
        this.commandManager,
        this.dialogManager,
        displayable);
    this.widgets.push(slider);
    domHelper.appendChild(displayableBaseElement, slider.getDom());
    // Add the base displayable element to the container.
    domHelper.appendChild(container, displayableBaseElement);
  }
};

/**
 * Handles what happens when the close button is clicked.
 * @private
 */
audioCat.ui.helperPanel.ContentProvider.prototype.handleCloseButtonPress_ =
    function() {
  // Request that the panel be hidden.
  this.dispatchEvent(audioCat.ui.helperPanel.EventType.HIDE);
};

/**
 * Retrieves the inner content of the panel. This method is overriden by content
 * providers to generate specialized content.
 * @return {!Element}
 * @protected
 */
audioCat.ui.helperPanel.ContentProvider.prototype.retrieveInnerContent =
    goog.abstractMethod;

/**
 * Cleans up any displayed content.
 */
audioCat.ui.helperPanel.ContentProvider.prototype.cleanUpContent = function() {
  this.domHelper.unlistenForPress(this.closeButtonInner_,
      this.handleCloseButtonPress_, false, this);
  this.cleanUpInnerContent();

  // Unlisten any lingering listeners.
  var listenKeys = this.listenKeys;
  for (var i = 0; i < listenKeys.length; ++i) {
    goog.events.unlistenByKey(listenKeys[i]);
  }
  this.listenKeys = [];

  // Clean up any widgets generated throughout the previous display.
  var oldWidgets = this.widgets;
  for (var i = 0; i < oldWidgets.length; ++i) {
    oldWidgets[i].cleanUp();
  }
  this.widgets = [];
};

/**
 * Cleans up the inner content of the panel. Overriden by other content
 * providers to clean up specialized content.
 * @protected
 */
audioCat.ui.helperPanel.ContentProvider.prototype.cleanUpInnerContent =
    goog.abstractMethod;
