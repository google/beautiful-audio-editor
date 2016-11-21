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
goog.provide('audioCat.app.App');

goog.require('audioCat.action.ActionManager');
goog.require('audioCat.action.ActionType');
goog.require('audioCat.action.IssueFeatureSupportComplaintAction');
goog.require('audioCat.action.render.ExportAction');
goog.require('audioCat.action.track.CreateEmptyTrackAction');
goog.require('audioCat.android.AndroidAmbassador');
goog.require('audioCat.android.StringConstant');
goog.require('audioCat.app.templates');
goog.require('audioCat.audio.Analyser');
goog.require('audioCat.audio.AudioContextManager');
goog.require('audioCat.audio.AudioGraph');
goog.require('audioCat.audio.AudioOrigination');
goog.require('audioCat.audio.AudioUnitConverter');
goog.require('audioCat.audio.SignatureTempoManager');
goog.require('audioCat.audio.play.PlayManager');
goog.require('audioCat.audio.play.TimeManager');
goog.require('audioCat.audio.play.events');
goog.require('audioCat.audio.record.MediaRecordManager');
goog.require('audioCat.audio.record.MediaSourceObtainer');
goog.require('audioCat.audio.render.AudioRenderer');
goog.require('audioCat.audio.render.ExportManager');
goog.require('audioCat.persistence.LocalStorageManager');
goog.require('audioCat.service.ServiceManager');
goog.require('audioCat.state.Clip'); // Remove after testing track addition.
goog.require('audioCat.state.LicenseManager');
goog.require('audioCat.state.MemoryManager');
goog.require('audioCat.state.SaveChecker');
goog.require('audioCat.state.Section'); // Remove after testing track addition.
goog.require('audioCat.state.StatePlanManager');
goog.require('audioCat.state.Track'); // Remove after testing track addition.
goog.require('audioCat.state.TrackManager');
goog.require('audioCat.state.command.CommandManager');
goog.require('audioCat.state.editMode.DuplicateSectionMode');
goog.require('audioCat.state.editMode.EditModeManager');
goog.require('audioCat.state.editMode.EditModeName');
goog.require('audioCat.state.editMode.SectionRemoveMode');
goog.require('audioCat.state.editMode.SectionSplitMode');
goog.require('audioCat.state.editMode.SelectEditMode');
goog.require('audioCat.state.effect.EffectId');
goog.require('audioCat.state.effect.EffectManager');
goog.require('audioCat.state.effect.EffectModelController');
goog.require('audioCat.state.prefs.Event');
goog.require('audioCat.state.prefs.PrefManager');
goog.require('audioCat.ui.TrackListingManager');
goog.require('audioCat.ui.dialog.EventType');
goog.require('audioCat.ui.helperPanel.ContentProviderId');
goog.require('audioCat.ui.helperPanel.HelperPanel');
goog.require('audioCat.ui.keyboard.KeyboardManager');
goog.require('audioCat.ui.master.MasterControllerWidget');
goog.require('audioCat.ui.menu.MenuBar');
goog.require('audioCat.ui.message.MessageDisplayerWidget');
goog.require('audioCat.ui.message.MessageManager');
goog.require('audioCat.ui.project.TitleManager');
goog.require('audioCat.ui.text.TimeFormatter');
goog.require('audioCat.ui.toolbar.CommandToolbar');
goog.require('audioCat.ui.toolbar.PlayToolbar');
goog.require('audioCat.ui.toolbar.RenderToolbar');
goog.require('audioCat.ui.toolbar.SectionToolbar');
goog.require('audioCat.ui.toolbar.ServiceToolbar');
goog.require('audioCat.ui.toolbar.SignatureToolbar');
goog.require('audioCat.ui.toolbar.ToolbarManager');
goog.require('audioCat.ui.toolbar.ViewToolbar');
goog.require('audioCat.ui.tracks.TimeDomainRuler');
goog.require('audioCat.ui.tracks.TrackAreaLineWidget');
goog.require('audioCat.ui.tracks.effect.EffectChipDragManager');
goog.require('audioCat.ui.tracks.widget.CreateEmptyTrackWidget');
goog.require('audioCat.ui.tracks.widget.ImportAudioWidget');
goog.require('audioCat.ui.visualization.Context2dPool');
goog.require('audioCat.ui.visualization.TimeDomainScaleManager');
goog.require('audioCat.ui.widget.ButtonPool');
goog.require('audioCat.ui.widget.ClipDetectorWidget');
goog.require('audioCat.ui.widget.HorizontalScrollWidget');
goog.require('audioCat.ui.widget.LoadingWidget');
goog.require('audioCat.ui.widget.PlayLineWidget');
goog.require('audioCat.ui.widget.PlayPointer');
goog.require('audioCat.ui.widget.PlayWidget');
goog.require('audioCat.ui.widget.ZoomWidget');
goog.require('audioCat.ui.window.ScrollResizeManager');
goog.require('audioCat.ui.tooltip.ToolTip');
goog.require('audioCat.utility.ArrayHexifier');
goog.require('audioCat.utility.DataUrlParser');
goog.require('audioCat.utility.IdGenerator');
goog.require('audioCat.utility.WebWorkerManager');
goog.require('audioCat.utility.dialog.DialogManager');
goog.require('audioCat.utility.support.SupportDetector');
goog.require('flags');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.string');
goog.require('soy');


/**
 * Initializes the application.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions with
 *     the DOM.
 * @param {!audioCat.state.Project} project The project to initialize for.
 * @constructor
 * @struct
 */
audioCat.app.App = function(domHelper, project) {
  /**
   * Facilitates interactions with the DOM.
   * @private {!audioCat.utility.DomHelper}
   */
  this.domHelper_ = domHelper;

  /**
   * Contains basic state on project, ie title.
   * @private {!audioCat.state.Project}
   */
  this.project_ = project;

  // Parses data URLs.
  var dataUrlParser = new audioCat.utility.DataUrlParser();

  // Define the android object if it exists (ie, we're in an Android web view).
  var opt_androidAmbassador;
  if (goog.global[audioCat.android.StringConstant.ANDROID_OBJECT]) {
    opt_androidAmbassador = new audioCat.android.AndroidAmbassador();
  }

  // Detects support for various features and formats.
  var supportDetector = new audioCat.utility.support.SupportDetector(domHelper);

  // Manages local storage data.
  var localStorageManager = new audioCat.persistence.LocalStorageManager();

  // Stores user settings.
  var prefManager = new audioCat.state.prefs.PrefManager(localStorageManager);
  prefManager.setFromLocalStorage();

  /**
   * Overall layout of the app.
   * @private {!Element}
   */
  this.layout_ = /** @type {!Element} */ (
      soy.renderAsFragment(audioCat.app.templates.mainApplication));
  var layout = this.layout_;
  if (FLAG_MOBILE) {
    goog.dom.classes.add(layout, goog.getCssName('mobileScrollableLayout'));

    // Disable scroll since we intend to handle horizontal scroll on our own.
    goog.events.listen(
        layout, 'scroll', this.suppressDefaultBehavior_, false, this);
  } else {
    // Note that CSS hovers will work. We disable CSS hovers for mobile since
    // the hovers are sticky: they stick around after buttons are pressed.
    goog.dom.classes.add(layout, goog.getCssName('hoverableApplication'));
  }

  // Tell the browser that this is an application.
  domHelper.setRole(layout, 'application');

  // TODO(chizeng): For the sake of speed, refactor ScrollResizeManager to
  // accept static lists of which elements to hold horizontally and vertically
  // fixed during the construction of the manager.

  // Generates successive unique integer IDs within a single thread.
  var idGenerator = new audioCat.utility.IdGenerator();

  /**
   * Generates successive unique integer IDs within a single thread.
   * @private {!audioCat.utility.IdGenerator}
   */
  this.idGenerator_ = idGenerator;

  // Manages audio contexts.
  var audioContextManager = new audioCat.audio.AudioContextManager();
  // Set the default sample rate to avoid contradictions.
  project.setSampleRate(audioContextManager.getSampleRate());

  /** @private {!audioCat.audio.AudioContextManager} */
  this.audioContextManager_ = audioContextManager;

  // Converts between typed arrays and hex.
  var arrayHexifier = new audioCat.utility.ArrayHexifier();

  // Formats time.
  var timeFormatter = new audioCat.ui.text.TimeFormatter();

  // Creates and manages buttons.
  var buttonPool = new audioCat.ui.widget.ButtonPool(domHelper);

  // Creates and manages web workers.
  var webWorkerManager = new audioCat.utility.WebWorkerManager();

  // Create a track manager to manage tracks.
  var trackManager = new audioCat.state.TrackManager();
  /** @private {!audioCat.state.TrackManager} */
  this.trackManager_ = trackManager;

  // Manages how many bytes we use.
  var memoryManager = new audioCat.state.MemoryManager(
      idGenerator, audioContextManager, trackManager);
  /** @private {!audioCat.state.MemoryManager} */
  this.memoryManager_ = memoryManager;

  // Create the command history manager for performing redos and undos.
  var commandManager = new audioCat.state.command.CommandManager(
      idGenerator, project, trackManager, memoryManager);
  /** @private {!audioCat.state.command.CommandManager} */
  this.commandManager_ = commandManager;

  // Manages window changes like scrolling and resizing.
  var scrollResizeManager = new audioCat.ui.window.ScrollResizeManager(
      domHelper);

  // Tooltip that appears now and then.
  /**
   * Tooltip that appears when the user hovers over some things.
   * @private {!audioCat.ui.tooltip.ToolTip}
   */
  this.toolTip_ =
      new audioCat.ui.tooltip.ToolTip(domHelper, scrollResizeManager);

  /**
   * Manages what happens when the user resizes or scrolls the window.
   * @private {!audioCat.ui.window.ScrollResizeManager}
   */
  this.scrollResizeManager_ = scrollResizeManager;


  // Manages messages displayed to the user.
  var messageManager = new audioCat.ui.message.MessageManager(idGenerator);
  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  // Displays those messages.
  var messageDisplayerWidget = new audioCat.ui.message.MessageDisplayerWidget(
      domHelper, messageManager);
  domHelper.appendChild(layout, messageDisplayerWidget.getDom());

  // Converts between units of audio as well as other standards.
  var audioUnitConverter = new audioCat.audio.AudioUnitConverter();

  // Manages dialogs.
  var dialogManager = new audioCat.utility.dialog.DialogManager(
      domHelper, scrollResizeManager, buttonPool);

  /**
   * Store the dialog manager.
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;

  // If we do not support web audio, don't initialize anything.
  // Also check for support of other features such as recording.
  var complainIfNoSupportAction =
      new audioCat.action.IssueFeatureSupportComplaintAction(
          supportDetector, dialogManager);
  complainIfNoSupportAction.doAction();
  if (!supportDetector.getWebAudioApiSupported()) {
    // No support for the web audio API. :/ We can't initialize the app.
    return;
  }

  // Manages the current tempo and time signature.
  var signatureTempoManager = new audioCat.audio.SignatureTempoManager();

  // Manages the models of various effects we can apply to audio.
  var effectModelController = new audioCat.state.effect.EffectModelController(
      this.idGenerator_);

  // Manages effects applied to the entire audio. Set default master effects.
  var masterEffectManager = new audioCat.state.effect.EffectManager(
      idGenerator,
      function() {
          return 'Master';
      }, effectModelController.getDefaultMasterEffects());

  // Pools 2D contexts so we don't create too many contexts.
  var context2dPool = new audioCat.ui.visualization.Context2dPool();

  // Manages the scale at which we render audio in the time domain. Also manages
  // whether we display score or time.
  var timeDomainScaleManager =
      new audioCat.ui.visualization.TimeDomainScaleManager(
          signatureTempoManager);

  // Manages edit modes. Make the select edit mode the initial one.
  var editModeManager = new audioCat.state.editMode.EditModeManager([
      new audioCat.state.editMode.SelectEditMode(commandManager, idGenerator),
      new audioCat.state.editMode.SectionSplitMode(
          scrollResizeManager,
          commandManager,
          idGenerator),
      new audioCat.state.editMode.SectionRemoveMode(
          commandManager, idGenerator),
      new audioCat.state.editMode.DuplicateSectionMode(
          commandManager, idGenerator)
    ], audioCat.state.editMode.EditModeName.SELECT);

  // Manages recording.
  var mediaSourceObtainer = new audioCat.audio.record.MediaSourceObtainer(
      idGenerator,
      supportDetector);
  var recordManager = new audioCat.audio.record.MediaRecordManager(
      audioContextManager,
      mediaSourceObtainer,
      idGenerator,
      trackManager,
      supportDetector);

  // Make sure the header does not scroll left/right and up/down.
  var header = domHelper.getElementByClassForSure(
      goog.getCssName('header'), layout);
  // The header is positioned fixedly, but other things must move around it.
  var headerOffsetter = domHelper.getElementByClassForSure(
      goog.getCssName('headerOffsetter'), layout);

  // Create a time-domain ruler to keep track of time.
  var rulerContainer = domHelper.getElementByClassForSure(
      goog.getCssName('rulerArea'), layout);

  /**
   * A function that positions everything around the header.
   * @private {!Function}
   */
  this.headerPositionResponseFunction_ =
      goog.bind(this.maintainHeight_, this,
          header, [headerOffsetter], [rulerContainer]);
  scrollResizeManager.callAfterResize(this.headerPositionResponseFunction_);

  // Hooks up audio nodes.
  var audioGraph = new audioCat.audio.AudioGraph(
      idGenerator,
      audioContextManager,
      trackManager,
      audioUnitConverter,
      masterEffectManager,
      project);
  var playManager = new audioCat.audio.play.PlayManager(
      audioContextManager, audioGraph);
  var timeManager = new audioCat.audio.play.TimeManager(playManager);

  var statePlanManager = new audioCat.state.StatePlanManager(
      project,
      idGenerator,
      audioContextManager,
      audioGraph,
      timeDomainScaleManager,
      trackManager,
      effectModelController,
      masterEffectManager,
      commandManager,
      memoryManager,
      arrayHexifier);

  /**
   * Manages services that integrate into the editor such as Google Drive.
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = new audioCat.service.ServiceManager(
      project,
      domHelper,
      commandManager,
      localStorageManager,
      prefManager,
      dialogManager,
      messageManager,
      memoryManager,
      statePlanManager,
      effectModelController,
      audioContextManager,
      this.idGenerator_);
  this.serviceManager_.makeAnyRelevantServiceMain();

  // Manages license registration.
  var licenseManager = new audioCat.state.LicenseManager(
      this.serviceManager_, localStorageManager);

  // Checks to see if we need to save ... say before the user exits.
  var saveChecker = new audioCat.state.SaveChecker(
      domHelper,
      commandManager,
      this.serviceManager_);

  // Makes an audio buffer out of the audio.
  var audioRenderer = new audioCat.audio.render.AudioRenderer(
      audioContextManager,
      audioGraph,
      trackManager,
      idGenerator);

  // Manages actions.
  var actionManager = new audioCat.action.ActionManager(
      project,
      domHelper,
      supportDetector,
      prefManager,
      commandManager,
      this.serviceManager_,
      saveChecker,
      dialogManager,
      effectModelController,
      masterEffectManager,
      idGenerator,
      audioContextManager,
      memoryManager,
      playManager,
      audioRenderer,
      recordManager,
      editModeManager,
      timeDomainScaleManager,
      messageManager,
      statePlanManager,
      licenseManager,
      dataUrlParser,
      opt_androidAmbassador);
  /**
   * @private {!audioCat.action.ActionManager}
   */
  this.actionManager_ = actionManager;

  // An action for displaying the dialog for adding new effects.
  var displayEffectSelectorAction = actionManager.retrieveAction(
      audioCat.action.ActionType.DISPLAY_EFFECT_SELECTOR);

  // An action that imports audio.
  var requestImportAudioAction = actionManager.retrieveAction(
      audioCat.action.ActionType.REQUEST_IMPORT_AUDIO);

  // An action for rendering audio.
  var renderAudioAction = actionManager.retrieveAction(
      audioCat.action.ActionType.RENDER_AUDIO_ACTION);

  // Manages keyboard interactions.
  var keyboardManager = new audioCat.ui.keyboard.KeyboardManager(
      idGenerator,
      actionManager,
      /** @type {!Element} */ (domHelper.getDocument().body));

  // Create the project title display.
  var titleManager = new audioCat.ui.project.TitleManager(
      idGenerator, project, domHelper, commandManager, keyboardManager);
  var titleContainer = domHelper.getElementByClassForSure(
      goog.getCssName('titleContainer'), layout);
  titleManager.render(titleContainer);

  // Manages exporting audio.
  var exportManager = new audioCat.audio.render.ExportManager(
      project,
      domHelper,
      audioRenderer,
      /** @type {!audioCat.action.RenderAudioAction} */ (renderAudioAction),
      webWorkerManager,
      opt_androidAmbassador);
  actionManager.addAction(
      audioCat.action.ActionType.EXPORT,
      new audioCat.action.render.ExportAction(
          exportManager,
          domHelper,
          messageManager,
          dialogManager,
          supportDetector,
          dataUrlParser,
          opt_androidAmbassador));

  // Manages the dragging of effect chips.
  var effectChipDragManager =
      new audioCat.ui.tracks.effect.EffectChipDragManager(
          this.idGenerator_, domHelper, commandManager);

  // Populate toolbars.
  var toolbarContainer = domHelper.getElementByClassForSure(
      goog.getCssName('toolbarArea'), layout);
  var toolbarManager = new audioCat.ui.toolbar.ToolbarManager(
      domHelper,
      toolbarContainer,
      editModeManager,
      this.serviceManager_,
      actionManager, [
        new audioCat.ui.toolbar.PlayToolbar(
            playManager,
            timeManager,
            domHelper,
            editModeManager,
            scrollResizeManager,
            actionManager,
            this.toolTip_),
        new audioCat.ui.toolbar.SectionToolbar(
            domHelper,
            editModeManager,
            actionManager,
            this.toolTip_),
        new audioCat.ui.toolbar.ViewToolbar(
            domHelper,
            editModeManager,
            actionManager,
            this.toolTip_),
        new audioCat.ui.toolbar.SignatureToolbar(
            domHelper,
            editModeManager,
            timeDomainScaleManager,
            commandManager,
            actionManager,
            this.toolTip_),
        new audioCat.ui.toolbar.CommandToolbar(
            domHelper,
            editModeManager,
            commandManager,
            actionManager,
            this.toolTip_),
        new audioCat.ui.toolbar.RenderToolbar(
            actionManager,
            exportManager,
            audioRenderer,
            idGenerator,
            commandManager,
            prefManager,
            domHelper,
            editModeManager,
            this.toolTip_)
      ],
      this.headerPositionResponseFunction_,
      this.toolTip_
    );
  toolbarManager.render();

  // Draws and updates the ruler as the user resizes, scrolls, and zooms.
  var rulerHeight = 25;
  var timeDomainRuler = new audioCat.ui.tracks.TimeDomainRuler(
      domHelper, timeDomainScaleManager, context2dPool, rulerHeight,
      scrollResizeManager, timeManager, playManager, timeFormatter);
  scrollResizeManager.callAfterScroll(
      goog.bind(timeDomainRuler.draw, timeDomainRuler));
  domHelper.appendChild(rulerContainer, timeDomainRuler.getDom());

  // Create a pointer in the ruler area that follows play.
  var playPointer = new audioCat.ui.widget.PlayPointer(
      domHelper, scrollResizeManager, playManager, timeManager,
      timeDomainScaleManager, timeFormatter);
  domHelper.appendChild(rulerContainer, playPointer.getDom());

  // Create a track ui displayer to manage the display of tracks.
  var trackEntriesContainer = domHelper.getElementByClassForSure(
      goog.getCssName('trackEntriesContainer'), layout);

  // Draws lines behind the track area.
  domHelper.appendChild(
      domHelper.getElementByClassForSure(
      goog.getCssName('trackLineDrawer'), layout),
      (new audioCat.ui.tracks.TrackAreaLineWidget(
          domHelper,
          timeDomainScaleManager,
          context2dPool,
          scrollResizeManager)).getDom());

  // Populate the buttons below the left side of the tracks.
  var trackAreaBottomLeft = domHelper.getElementByClassForSure(
      goog.getCssName('trackLeftSideBottomButtons'), layout);
  scrollResizeManager.fixLeft(trackAreaBottomLeft);

  // Create a button for creating empty tracks.
  var createEmptyTrackAction = new audioCat.action.track.CreateEmptyTrackAction(
      idGenerator, commandManager);
  var createEmptyTrackWidget =
      new audioCat.ui.tracks.widget.CreateEmptyTrackWidget(
          domHelper, createEmptyTrackAction);
  domHelper.appendChild(trackAreaBottomLeft, createEmptyTrackWidget.getDom());

  // Create a button for importing audio into a new track.
  var importAudioWidget = new audioCat.ui.tracks.widget.ImportAudioWidget(
      domHelper,
      /** @type {!audioCat.action.RequestAudioImportAction} */ (
          requestImportAudioAction));
  domHelper.appendChild(trackAreaBottomLeft, importAudioWidget.getDom());

  // Create a line that follows the playing of audio.
  domHelper.appendChild(
      domHelper.getElementByClassForSure(
      goog.getCssName('playLineContainer'), layout),
      (new audioCat.ui.widget.PlayLineWidget(
          domHelper,
          timeDomainScaleManager,
          scrollResizeManager,
          timeManager)).getDom());

  // Analyzes master audio output.
  var masterAudioAnalyser = new audioCat.audio.Analyser(
      project.getNumberOfChannels());
  masterAudioAnalyser.setAnalyserJunction(audioGraph.getAnalyserJunction());
  masterAudioAnalyser.setChannelAnalyserJunctions(
      audioGraph.getChannelAnalyserJunctions());

  // The helper panel that adds miscellaneous functionality when it is needed.
  var rightSideContainer = domHelper.getElementByClassForSure(
      goog.getCssName('rightPanel'), layout);
  var helperPanelWidget = new audioCat.ui.helperPanel.HelperPanel(
      this.idGenerator_,
      domHelper,
      context2dPool,
      playManager,
      audioUnitConverter,
      commandManager,
      dialogManager,
      signatureTempoManager,
      masterEffectManager,
      masterAudioAnalyser,
      prefManager);

  // Lets the user alter options for effects when effects are in focus.
  var effectContentProvider =
      /** @type {!audioCat.ui.helperPanel.EffectContentProvider} */ (
          helperPanelWidget.getContentProvider(
              audioCat.ui.helperPanel.ContentProviderId.EFFECT));

  // Lists and visualizes tracks.
  var trackListingManager = new audioCat.ui.TrackListingManager(
      this.idGenerator_,
      domHelper,
      keyboardManager,
      trackManager,
      trackEntriesContainer,
      commandManager,
      context2dPool,
      timeDomainScaleManager,
      editModeManager,
      scrollResizeManager,
      timeManager,
      playManager,
      dialogManager,
      timeFormatter,
      audioUnitConverter,
      effectContentProvider,
      effectChipDragManager,
      /** @type {!audioCat.action.DisplayEffectSelectorAction} */ (
          displayEffectSelectorAction));

  // Add the right side helper panel to the correct part of the layout.
  domHelper.appendChild(rightSideContainer, helperPanelWidget.getDom());

  // Add a menu bar.
  var menuBarContainer = domHelper.getElementByClassForSure(
      goog.getCssName('menu-bar'), layout);
  var menuBar = new audioCat.ui.menu.MenuBar(
      idGenerator,
      project,
      trackManager,
      menuBarContainer,
      domHelper,
      commandManager,
      memoryManager,
      dialogManager,
      playManager,
      audioContextManager,
      actionManager,
      exportManager,
      statePlanManager,
      this.serviceManager_,
      licenseManager,
      prefManager,
      /** @type {!audioCat.action.RequestAudioImportAction} */ (
          requestImportAudioAction));

  var footerLeftSideContainer = domHelper.getElementByClassForSure(
      goog.getCssName('footerLeftSide'), layout);

  // Controls master configurations.
  var masterSettingsContentProvider =
      /** @type {!audioCat.ui.helperPanel.MasterSettingsContentProvider} */ (
          helperPanelWidget.getContentProvider(
              audioCat.ui.helperPanel.ContentProviderId.MASTER_SETTINGS));
  domHelper.appendChild(footerLeftSideContainer,
      new audioCat.ui.master.MasterControllerWidget(
          this.idGenerator_,
          domHelper,
          actionManager,
          commandManager,
          playManager,
          project.getNumberOfChannels(),
          effectContentProvider,
          masterSettingsContentProvider,
          masterEffectManager,
          masterAudioAnalyser,
          effectChipDragManager,
          /** @type {!audioCat.action.DisplayEffectSelectorAction} */ (
              displayEffectSelectorAction)).getDom());

  // Create a widget for controlling zoom.
  var zoomWidget = new audioCat.ui.widget.ZoomWidget(
      domHelper, timeDomainScaleManager, dialogManager);
  domHelper.appendChild(footerLeftSideContainer, zoomWidget.getDom());

  // TODO(chizeng): Place these on the helper panel.

  // Create a widget for controlling master volume.
  // var masterVolumeWidget = new audioCat.ui.widget.MasterVolumeWidget(
  //     domHelper,
  //     audioGraph,
  //     commandManager,
  //     dialogManager,
  //     audioUnitConverter);
  // domHelper.appendChild(
  //     footerLeftSideContainer, masterVolumeWidget.getDom());

  // // Create a slider widget for controlling the tempo.
  // var tempoWidget = new audioCat.ui.widget.TempoSliderWidget(
  //     domHelper, signatureTempoManager, commandManager, dialogManager);
  // domHelper.appendChild(footerLeftSideContainer, tempoWidget.getDom());

  // Possibly let the view change while scrolling.
  this.possiblySetUpScrollWhilePlaying_(
      prefManager,
      playManager,
      timeManager,
      scrollResizeManager,
      timeDomainScaleManager);

  // Create a widget that allows for playing, rendering, and recording audio.
  var playWidget = new audioCat.ui.widget.PlayWidget(
      domHelper,
      actionManager,
      idGenerator,
      recordManager,
      audioRenderer,
      commandManager,
      timeFormatter);
  var playWidgetWrapper = domHelper.getElementByClassForSure(
      goog.getCssName('playWidgetContainerWrapper'), layout);
  domHelper.appendChild(playWidgetWrapper, playWidget.getDom());

  var masterClipDetectorWidget = new audioCat.ui.widget.ClipDetectorWidget(
      domHelper,
      playManager,
      masterAudioAnalyser,
      project.getNumberOfChannels());
  domHelper.appendChild(
      domHelper.getElementByClassForSure(
           goog.getCssName('masterClipDetectorWidgetContainerWrapper'), layout),
      masterClipDetectorWidget.getDom()
  );

  if (FLAG_MOBILE) {
    // Create a horizonatal scrollbar for mobile.
    domHelper.appendChild(
        domHelper.getElementByClassForSure(goog.getCssName('footer'), layout),
        new audioCat.ui.widget.HorizontalScrollWidget(
            domHelper,
            scrollResizeManager,
            timeDomainScaleManager,
            dialogManager,
            layout).getDom()
      );
  }
};


/**
 * Renders the application within a container.
 * @param {!Element} container The container in which to render the application.
 *     Will be cleared first.
 */
audioCat.app.App.prototype.render = function(container) {
  var domHelper = this.domHelper_;
  domHelper.removeChildren(container);
  domHelper.appendChild(container, this.layout_);

  // Request full screen on mobile.
  // Disable for now since the assert fails in a web view.
  // if (FLAG_MOBILE) {
  //   this.scrollResizeManager_.hackFullScreen();
  //   this.scrollResizeManager_.requestFullScreen(this.layout_);
  // }

  // Correctly offset the main content based on the header's height.
  this.headerPositionResponseFunction_();

  // Allow for scroll computations since we now can gauge the length of the
  // layout.
  this.scrollResizeManager_.setIsGoodTimeForScrollCompute(true);

  // If the user tries to close, check for pending changes and warn the user if
  // there are any.
  var action = this.actionManager_.retrieveAction(
      audioCat.action.ActionType.CHECK_FOR_GENERIC_SAVE_NEEDED);
  action.doAction();

  // Integrate with the first service that is relevant if any.
  var serviceManager = this.serviceManager_;
  var primaryService = serviceManager.getPrimaryService();
  if (primaryService) {
    // Should we prompt an installation here?
    this.messageManager_.issueMessage('Integrating with ' +
        primaryService.getServiceName() + ' ...');
    // Try to install if the user is either not signed in or uninstalled.
    // Otherwise, load the project.
    primaryService.takeAppropriateAction(this.actionManager_);
  } else {
    // We lack a primary service, but are we doing the tutorial?
    if (goog.global.location.href.match(/\/introduction$/) ||
        goog.global.location.href.match(/[\?&]introduction=1/)) {
      this.initializeTutorial_(
          this.project_,
          this.audioContextManager_,
          this.trackManager_,
          this.dialogManager_);
    }
  }

  // Initialize the tool tip that appears when the user hovers over things.
  domHelper.appendChild(domHelper.getDocument().body, this.toolTip_.getDom());
};


/**
 * Initializes the tutorial.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @private
 */
audioCat.app.App.prototype.initializeTutorial_ = function(
    project, audioContextManager, trackManager, dialogManager) {

  // Create a dialog that details loading the project.
  var dialogContent = this.domHelper_.createDiv();
  var dialogText = this.domHelper_.createDiv();
  var descriptionSpan = this.domHelper_.createElement('span');
  this.domHelper_.setRawInnerHtml(descriptionSpan, 'Loading audio files ... ');
  this.domHelper_.appendChild(dialogText, descriptionSpan);
  var statusSpan = this.domHelper_.createElement('span');
  this.domHelper_.appendChild(dialogText, statusSpan);

  var loadingWidget = new audioCat.ui.widget.LoadingWidget(this.domHelper_, 0);
  this.domHelper_.appendChild(dialogContent, dialogText);
  var loadingWidgetWrapper = this.domHelper_.createDiv(
      goog.getCssName('appLoadingWidgetWrapper'));
  this.domHelper_.appendChild(loadingWidgetWrapper, loadingWidget.getDom());
  this.domHelper_.appendChild(dialogContent, loadingWidgetWrapper);
  var dialog = dialogManager.obtainDialog(dialogContent);

  // Clean up after dialog closes.
  dialog.listenOnce(audioCat.ui.dialog.EventType.BEFORE_HIDDEN, function() {
    // Clean up the loading widget.
    loadingWidget.cleanUp();
  });

  // Show the dialog asap.
  dialogManager.showDialog(dialog);

  // Set the name of the whole project.
  project.setTitle('Just Don\'t Mix');

  // Pairings of mp3 file name and track name.
  var audioFiles = [
    ['kd-sd', 'kick + snare drums'],
    ['hh-perc', 'hi-hats, percussion'],
    ['bass', 'bass'],
    ['keys', 'keys'],
    ['synth', 'synth']
  ];

  // Each file contributes a unit of 1 towards progress. For each file, 0.5 of
  // that progress is retrieving the file across the network. The other 0.5 is
  // actually rendering the file.
  var progressPerFile = new Array(audioFiles.length);
  for (var i = 0; i < progressPerFile.length; i++) {
    progressPerFile[i] = 0;
  }

  var sumReduceFunction = function(cumulativeSum, value) {
    return cumulativeSum + value;
  };

  // Updates the progress bar based on the current progress.
  var updateProgressUi = function() {
    // The progress is just the normalized sum of each file's progress.
    loadingWidget.setProgress(
        progressPerFile.reduce(sumReduceFunction, 0) / progressPerFile.length);
  };

  // Track tracks. :)
  var filesLoaded = 0;
  var tracks = new Array(audioFiles.length);
  var audioChests = new Array(audioFiles.length);

  // Creates a track from an mp3.
  var createTrack = goog.bind(function(pairingIndex) {
    var pairing = audioFiles[pairingIndex];
    var request = new XMLHttpRequest();
    request.open(
        'GET',
        'https://chizeng.com/beautifulAudioEditorTutorial/' + pairing[0] +
            '.mp3',
        true);
    request.responseType = 'arraybuffer';
    var idGenerator = this.idGenerator_;
    request.onload = goog.bind(function() {
      audioContextManager.createAudioBuffer(
          /** @type {!ArrayBuffer} */ (request.response),
          goog.bind(function(audioBuffer) {
            var audioChest = new audioCat.audio.AudioChest(
                /** @type {!AudioBuffer} */ (audioBuffer),
                pairing[1],
                audioCat.audio.AudioOrigination.IMPORTED,
                idGenerator);
            // Section has 0 begin time.
            var section = new audioCat.state.Section(
                idGenerator, audioChest, pairing[1], 0);
            section.addClip(new audioCat.state.Clip(
                idGenerator, 0, audioChest.getNumberOfSamples()));
            var track = new audioCat.state.Track(
                idGenerator, pairing[1]);
            track.addSection(section);

            // Note that this track is done.
            tracks[pairingIndex] = track;
            audioChests[pairingIndex] = audioChest;
            filesLoaded++;
            // Mark this file's progress to be 100%.
            progressPerFile[pairingIndex] = 1;
            updateProgressUi();
            if (filesLoaded == audioFiles.length) {
              // We've loaded all files! Add them to the project.
              for (var t = 0; t < tracks.length; t++) {
                // Use the command manager to add the track in order to update
                // the memory usage stats alongside adding the track.
                this.commandManager_.justDoCommand(
                    new audioCat.state.command.AddTrackCommand(
                        idGenerator, audioFiles[t][1], audioChests[t]));
                // Update the memory manager - we just added some bytes.
                this.memoryManager_.addBytes(
                    audioChests[t].obtainTotalByteSize());
              }

              // Show the tutorial screen.
              var tutorialDom = /** @type {!Element} */ (
                  soy.renderAsFragment(audioCat.app.templates.tutorial));

              // Set up listeners for the tutorial.
              var beginButton = this.domHelper_.getElementByClassForSure(
                  goog.getCssName('kButton'), tutorialDom);
              var backgroundClickEventKey;
              var closeTutorialFunction = goog.bind(function(event) {
                event.preventDefault();
                this.domHelper_.removeNode(tutorialDom);
                this.domHelper_.unlistenForPress(
                    beginButton, closeTutorialFunction);
                if (backgroundClickEventKey) {
                  goog.events.unlistenByKey(backgroundClickEventKey);
                }
              }, this);
              this.domHelper_.listenForPress(
                  beginButton, closeTutorialFunction);
              this.domHelper_.appendChild(
                  goog.dom.getDocument().body, tutorialDom);

              // Also close if the user clicks on the background of the tutorial.
              backgroundClickEventKey = goog.events.listen(
                  tutorialDom, 'click', function(event) {
                if (event.target === tutorialDom) {
                  // The user clicked the background. Close the dialog.
                  closeTutorialFunction(event);
                }
              });

              // Close the loading dialog.
              dialogManager.hideDialog(dialog);
            }
      }, this), goog.nullFunction);
    }, this);

    /** @param {!ProgressEvent} event */
    request.onprogress = function(event) {
      // 0.5 of the file progress is retrieving the file from the network.
      progressPerFile[pairingIndex] = event.loaded / event.total / 2;
      updateProgressUi();
    };

    request.send();
  }, this);

  // Create the tracks.
  for (var a = 0; a < audioFiles.length; a++) {
    createTrack(a);
  }
};


/**
 * Sets the height of every element in the given array to the height of the
 * target element. This is useful when we want to fixedly position an element,
 * but want other elements to position themselves relative to the fixed element.
 * @param {!Element} targetElement The element to obtain the height from.
 * @param {!Array.<!Element>} followerElements Elements to set the height of to
 *     the height of the target.
 * @param {!Array.<!Element>} topFollowerElements Elements to set the top
 *     CSS property to the height.
 * @private
 */
audioCat.app.App.prototype.maintainHeight_ = function(
    targetElement,
    followerElements,
    topFollowerElements) {
  var targetHeightPixelString = Math.round(targetElement.offsetHeight) + 'px';
  for (var i = 0; i < followerElements.length; ++i) {
    followerElements[i].style.height = targetHeightPixelString;
  }
  for (var i = 0; i < topFollowerElements.length; ++i) {
    topFollowerElements[i].style.top = targetHeightPixelString;
  }
};


/**
 * Adds a track with a section with audio based on the URL. Used for debugging.
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages
 *     audio API details.
 * @param {!audioCat.state.TrackManager} trackManager Manages tracks.
 * @param {string} url The URL of the audio file.
 * @param {string=} opt_sectionName The name of new section. Defaults to URL.
 * @private
 */
audioCat.app.App.prototype.addTrackFromUrl_ = function(
    audioContextManager, trackManager, url, opt_sectionName) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  var idGenerator = this.idGenerator_;
  request.onload = function() {
    audioContextManager.createAudioBuffer(
        /** @type {!ArrayBuffer} */ (request.response),
        function(audioBuffer) {
          var audioChest = new audioCat.audio.AudioChest(
              /** @type {!AudioBuffer} */ (audioBuffer),
              url,
              audioCat.audio.AudioOrigination.IMPORTED,
              idGenerator);
          // Section has 0 begin time.
          var section = new audioCat.state.Section(
              idGenerator, audioChest, url, 0);
          section.addClip(new audioCat.state.Clip(
              idGenerator, 0, audioChest.getNumberOfSamples()));
          var track = new audioCat.state.Track(
              idGenerator, opt_sectionName || url);
          track.addSection(section);
          trackManager.addTrack(track);
    }, goog.nullFunction);
  };
  request.send();
};


/**
 * Suppresses the default behavior of an event. Used to prevent native scrolling
 * in the application on mobile (since we want to handle our own scrolling) for
 * instance.
 * @param {!goog.events.Event} e The event to suppress.
 * @return {boolean} False in order to suppress propagation.
 * @private
 */
audioCat.app.App.prototype.suppressDefaultBehavior_ = function(e) {
  e.preventDefault();
  return false;
};


/**
 * Sets up logic for scrolling the view while playing if applicable.
 * @param {!audioCat.state.prefs.PrefManager} prefManager
 * @param {!audioCat.audio.play.PlayManager} playManager
 * @param {!audioCat.audio.play.TimeManager} timeManager
 * @param {!audioCat.ui.window.ScrollResizeManager} scrollResizeManager
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager} 
 *     timeDomainScaleManager
 * @private
 */
audioCat.app.App.prototype.possiblySetUpScrollWhilePlaying_ = function(
    prefManager,
    playManager,
    timeManager,
    scrollResizeManager,
    timeDomainScaleManager) {
  var scrollToPosition = function() {
    // Compute width of the audio display area.
    var audioDisplayWidth = scrollResizeManager.getWindowWidth() -
        audioCat.ui.window.ScrollResizeManager.SIDEBAR_WIDTH;

    // Scroll to the right place. Center the indicator.
    var scale = timeDomainScaleManager.getCurrentScale();
    var destinationXScroll =
        scale.convertToPixels(timeManager.getIndicatedTime()) -
            audioDisplayWidth / 2;
    scrollResizeManager.scrollTo(
        destinationXScroll > 0 ? destinationXScroll : 0,
        scrollResizeManager.getTopBottomScroll());
  };
  var changeCount = 0;
  var handleTimeChange = function() {
    // Only scroll every 3rd change.
    // changeCount++;
    // if (changeCount % 30 == 0) {
    //   scrollToPosition();
    // }
    scrollToPosition();
  };
  var handlePlayBegin = function() {
    timeManager.listen(
        audioCat.audio.play.events.INDICATED_TIME_CHANGED, handleTimeChange);
  };
  var handlePause = function() {
    timeManager.unlisten(
        audioCat.audio.play.events.INDICATED_TIME_CHANGED, handleTimeChange);
    // Reconcile position.
    scrollToPosition();
  };
  var enableScrollingWhilePlaying = function() {
    (playManager.getPlayState() ? handlePlayBegin : handlePause)();
    playManager.listen(audioCat.audio.play.events.PLAY_BEGAN, handlePlayBegin);
    playManager.listen(audioCat.audio.play.events.PAUSED, handlePause);
  };
  var disableScrollingWhilePlaying = function() {
    handlePause();
    playManager.unlisten(
        audioCat.audio.play.events.PLAY_BEGAN, handlePlayBegin);
    playManager.unlisten(audioCat.audio.play.events.PAUSED, handlePause);
  }; 
  if (prefManager.getScrollWhilePlayingEnabled()) {
    enableScrollingWhilePlaying();
  }
  // Possibly turn scrolling off / on later.
  prefManager.listen(
      audioCat.state.prefs.Event.SCROLL_WHILE_PLAYING_ENABLED_CHANGED,
      function() {
        (prefManager.getScrollWhilePlayingEnabled() ?
            enableScrollingWhilePlaying : disableScrollingWhilePlaying)();
      });
};
