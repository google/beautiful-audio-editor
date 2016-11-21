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
goog.provide('audioCat.ui.helperPanel.HelperPanel');

goog.require('audioCat.ui.helperPanel.ContentProviderId');
goog.require('audioCat.ui.helperPanel.EffectContentProvider');
goog.require('audioCat.ui.helperPanel.EventType');
goog.require('audioCat.ui.helperPanel.MasterSettingsContentProvider');
goog.require('audioCat.ui.widget.Widget');
goog.require('goog.asserts');
goog.require('goog.dom.classes');
goog.require('goog.events');


/**
 * A panel that helps the main flow of actions by adding functionality when
 * useful. For instance, details about an effect may display here when the user
 * focuses on an effect.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools
 *     contexts so we do not make too many.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages playback.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between audio units.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.SignatureTempoManager} signatureTempoManager Manages
 *     the current time signature and tempo.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Manages
 *     effects for the master output.
 * @param {!audioCat.audio.Analyser} masterAudioAnalyser Lets us poll master
 *     audio output.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.helperPanel.HelperPanel = function(
    idGenerator,
    domHelper,
    context2dPool,
    playManager,
    audioUnitConverter,
    commandManager,
    dialogManager,
    signatureTempoManager,
    masterEffectManager,
    masterAudioAnalyser,
    prefManager) {
  var panelContainer = domHelper.createDiv(goog.getCssName('helperPanel'));
  goog.base(this, panelContainer);

  /**
   * Contains the content from content providers.
   * @private {!Element}
   */
  this.contentContainer_ = domHelper.createDiv(
      goog.getCssName('contentContainer'));
  domHelper.appendChild(panelContainer, this.contentContainer_);

  /**
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * A mapping between ID and content provider. A content provider generates
   * content for display.
   * @private {!Object.<audioCat.ui.helperPanel.ContentProviderId,
   *     !audioCat.ui.helperPanel.ContentProvider>}
   */
  this.contentProviders_ = {};
  this.addContentProvider_(
      audioCat.ui.helperPanel.ContentProviderId.EFFECT,
      new audioCat.ui.helperPanel.EffectContentProvider(
          idGenerator,
          domHelper,
          context2dPool,
          playManager,
          audioUnitConverter,
          commandManager,
          dialogManager,
          prefManager
        ));
  this.addContentProvider_(
      audioCat.ui.helperPanel.ContentProviderId.MASTER_SETTINGS,
      new audioCat.ui.helperPanel.MasterSettingsContentProvider(
          idGenerator,
          domHelper,
          playManager,
          commandManager,
          dialogManager,
          signatureTempoManager,
          context2dPool,
          audioUnitConverter,
          masterEffectManager,
          masterAudioAnalyser,
          prefManager
        ));

  /**
   * The current content provider that is shown. Null if none is shown.
   * @private {audioCat.ui.helperPanel.ContentProvider}
   */
  this.shownProvider_ = null;
};
goog.inherits(audioCat.ui.helperPanel.HelperPanel, audioCat.ui.widget.Widget);

/**
 * Adds a content provider.
 * @param {audioCat.ui.helperPanel.ContentProviderId} id The ID of the content
 *     provider.
 * @param {!audioCat.ui.helperPanel.ContentProvider} contentProvider The content
 *     provider to add.
 * @private
 */
audioCat.ui.helperPanel.HelperPanel.prototype.addContentProvider_ = function(
    id, contentProvider) {
  goog.events.listen(contentProvider, audioCat.ui.helperPanel.EventType.SHOW,
      this.handleContentProviderShowRequest_, false, this);
  goog.events.listen(contentProvider, audioCat.ui.helperPanel.EventType.HIDE,
      this.handleContentProviderHideRequest_, false, this);
  this.contentProviders_[id] = contentProvider;
};

/**
 * Handles what happens when a content provider requests to be shown.
 * @param {!goog.events.Event} event The associated event.
 * @private
 */
audioCat.ui.helperPanel.HelperPanel.prototype.
    handleContentProviderShowRequest_ = function(event) {
  var contentProviderToShow =
      /** @type {!audioCat.ui.helperPanel.ContentProvider} */ (event.target);
  var domHelper = this.domHelper_;
  this.hideShownContent();
  this.showProvider_(contentProviderToShow);
};

/**
 * Shows the helper panel with content from some provider. Assumes no provider
 * currently is shown.
 * @param {!audioCat.ui.helperPanel.ContentProvider} contentProvider The
 *     provider from which to retrieve content.
 * @private
 */
audioCat.ui.helperPanel.HelperPanel.prototype.showProvider_ = function(
    contentProvider) {
  this.shownProvider_ = contentProvider;
  this.domHelper_.appendChild(
      this.contentContainer_, contentProvider.retrieveContent());
  this.setWholeHelperPanelShownState_(true);
};

/**
 * Handles what happens when a content provider requests that the helper panel
 * be hidden.
 * @private
 */
audioCat.ui.helperPanel.HelperPanel.prototype.
    handleContentProviderHideRequest_ = function() {
  this.hideShownContent();
};

/**
 * Hides shown content if content is shown. Otherwise, does nothing.
 */
audioCat.ui.helperPanel.HelperPanel.prototype.hideShownContent = function() {
  if (this.shownProvider_) {
    this.shownProvider_.cleanUpContent();
    this.domHelper_.removeChildren(this.contentContainer_);
    this.shownProvider_ = null;
    this.setWholeHelperPanelShownState_(false);
  }
};

/**
 * Sets whether the whole helper panel if is shown or not.
 * @param {boolean} helperPanelShown Whether the panel is to be shown.
 * @private
 */
audioCat.ui.helperPanel.HelperPanel.prototype.setWholeHelperPanelShownState_ =
    function(helperPanelShown) {
  (helperPanelShown ? goog.dom.classes.add : goog.dom.classes.remove)(
      this.getDom(), goog.getCssName('shown'));
};

/**
 * Retrieves a content provider given its ID. Assumes that the ID exists.
 * @param {audioCat.ui.helperPanel.ContentProviderId} id The ID of the content
 *     provider.
 * @return {!audioCat.ui.helperPanel.ContentProvider} The content provider with
 *     that ID.
 */
audioCat.ui.helperPanel.HelperPanel.prototype.getContentProvider =
    function(id) {
  var contentProvider = this.contentProviders_[id];
  goog.asserts.assert(contentProvider);
  return contentProvider;
};
