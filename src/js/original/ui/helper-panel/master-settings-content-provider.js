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
goog.provide('audioCat.ui.helperPanel.MasterSettingsContentProvider');

goog.require('audioCat.audio.record.RecordingChannelsAllowed');
goog.require('audioCat.ui.helperPanel.ContentProvider');
goog.require('audioCat.ui.widget.BooleanToggleWidget');
goog.require('audioCat.ui.widget.EventType');
goog.require('audioCat.ui.widget.FrequencySpectrumAnalyser');
goog.require('audioCat.ui.widget.SelectInputWidget');
goog.require('audioCat.ui.widget.TempoSliderWidget');
goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.string');


/**
 * Provides an interface for altering master settings in the helper panel.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages play.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus allows for undo and redo.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @param {!audioCat.audio.SignatureTempoManager} signatureTempoManager Manages
 *     the current time signature and tempo.
 * @param {!audioCat.ui.visualization.Context2dPool} context2dPool Pools
 *     contexts so we do not make too many.
 * @param {!audioCat.audio.AudioUnitConverter} audioUnitConverter Converts
 *     between audio units.
 * @param {!audioCat.state.effect.EffectManager} masterEffectManager Manages
 *     effects for the master output.
 * @param {!audioCat.audio.Analyser} masterAudioAnalyser Lets us poll master
 *     audio output.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @constructor
 * @extends {audioCat.ui.helperPanel.ContentProvider}
 */
audioCat.ui.helperPanel.MasterSettingsContentProvider = function(
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
    prefManager) {
  goog.base(this,
      idGenerator,
      domHelper,
      playManager,
      commandManager,
      dialogManager,
      prefManager);

  /**
   * @private {!audioCat.audio.SignatureTempoManager}
   */
  this.signatureTempoManager_ = signatureTempoManager;

  /**
   * @private {!audioCat.ui.visualization.Context2dPool}
   */
  this.context2dPool_ = context2dPool;

  /**
   * @private {!audioCat.audio.AudioUnitConverter}
   */
  this.audioUnitConverter_ = audioUnitConverter;

  /**
   * @private {!audioCat.state.effect.EffectManager}
   */
  this.masterEffectManager_ = masterEffectManager;

  /**
   * @private {!audioCat.audio.Analyser}
   */
  this.masterAudioAnalyser_ = masterAudioAnalyser;
};
goog.inherits(audioCat.ui.helperPanel.MasterSettingsContentProvider,
    audioCat.ui.helperPanel.ContentProvider);

/** @override */
audioCat.ui.helperPanel.MasterSettingsContentProvider.prototype.
    retrieveInnerContent =
    function() {
  var domHelper = this.domHelper;
  var innerContent = domHelper.createDiv(goog.getCssName('innerContent'));
  goog.dom.classes.add(
      innerContent, goog.getCssName('masterSettingsHelperPanel'));

  // Include a title.
  var title = domHelper.createElement('h2');
  goog.dom.classes.add(title, goog.getCssName('helperPanelTitle'));
  domHelper.setRawInnerHtml(title, 'Master Settings');
  domHelper.appendChild(innerContent, title);

  var descriptionOfTempo = domHelper.createElement('p');
  domHelper.setRawInnerHtml(descriptionOfTempo,
      'This sets the tempo for the grid when the grid displays based on ' +
          'time signature and does not affect the actual audio.');
  domHelper.appendChild(innerContent, descriptionOfTempo);

  // Create a slider for altering the tempo for displaying a grid.
  var tempoSliderWidget = new audioCat.ui.widget.TempoSliderWidget(
      this.idGenerator,
      domHelper,
      this.signatureTempoManager_,
      this.commandManager,
      this.dialogManager);
  this.widgets.push(tempoSliderWidget);
  domHelper.appendChild(innerContent, tempoSliderWidget.getDom());

    var playWhileRecordingWidget = new audioCat.ui.widget.BooleanToggleWidget(
      domHelper,
      'Play while recording.',
      this.prefManager.getPlayWhileRecording()
    );
  this.listenKeys.push(goog.events.listen(
      playWhileRecordingWidget,
      audioCat.ui.widget.EventType.BOOLEAN_TOGGLED,
      function(event) {
        this.prefManager.setPlayWhileRecording(event.target.getValue());
      }, false, this));
  this.widgets.push(playWhileRecordingWidget);
  domHelper.appendChild(innerContent, playWhileRecordingWidget.getDom());

  var recordAtBeginningWidget = new audioCat.ui.widget.BooleanToggleWidget(
      domHelper,
      'Start recording from time 0.',
      this.prefManager.getPlaceNewRecordingAtBeginning()
    );
  this.listenKeys.push(goog.events.listen(
      recordAtBeginningWidget,
      audioCat.ui.widget.EventType.BOOLEAN_TOGGLED,
      function(event) {
        this.prefManager.setPlaceNewRecordingAtBeginning(
            event.target.getValue());
      }, false, this));
  this.widgets.push(recordAtBeginningWidget);
  domHelper.appendChild(innerContent, recordAtBeginningWidget.getDom());

  var changeViewWhilePlayingWidget = new audioCat.ui.widget.BooleanToggleWidget(
      domHelper,
      'Change view while playing.',
      this.prefManager.getScrollWhilePlayingEnabled()
    );
  this.listenKeys.push(goog.events.listen(
      changeViewWhilePlayingWidget,
      audioCat.ui.widget.EventType.BOOLEAN_TOGGLED,
      function(event) {
        this.prefManager.setScrollWhilePlayingEnabled(event.target.getValue());
      }, false, this));
  this.widgets.push(changeViewWhilePlayingWidget);
  domHelper.appendChild(innerContent, changeViewWhilePlayingWidget.getDom());

  // Add a widget for changing the number of recording channels used.
  var channelCountChoices = goog.array.map(
      audioCat.audio.record.RecordingChannelsAllowed,
      function(channel) {
        var channelString = '' + channel;
        return {
          k: channelString,
          v: channelString
        };
      });
  var channelSelector = new audioCat.ui.widget.SelectInputWidget(
      domHelper,
      'Channels to record with:',
      channelCountChoices,
      0 // The index of the initial choice.
    );
  this.listenKeys.push(goog.events.listen(
      channelSelector,
      audioCat.ui.widget.EventType.SELECTION_CHANGED,
      function(event) {
        this.prefManager.setChannelsForRecording(
            goog.string.toNumber(event.target.getCurrentKey()));
      }, false, this));
  this.widgets.push(channelSelector);
  domHelper.appendChild(innerContent, channelSelector.getDom());

  // Add a frequency spectrum analyser for the master output.
  var frequencySpectrumAnalyser =
      new audioCat.ui.widget.FrequencySpectrumAnalyser(
          this.domHelper,
          this.context2dPool_,
          this.playManager,
          this.audioUnitConverter_,
          this.masterEffectManager_,
          this.masterAudioAnalyser_
        );
  this.widgets.push(frequencySpectrumAnalyser);
  domHelper.appendChild(innerContent, frequencySpectrumAnalyser.getDom());

  return innerContent;
};

/** @override */
audioCat.ui.helperPanel.MasterSettingsContentProvider.prototype.
    cleanUpInnerContent = function() {};
