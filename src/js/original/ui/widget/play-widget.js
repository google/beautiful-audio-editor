goog.provide('audioCat.ui.widget.PlayWidget');

goog.require('audioCat.audio.play.events');
goog.require('audioCat.ui.widget.DefaultRecordTimerWidget');
goog.require('audioCat.ui.widget.PlayWidgetRecordManager');
goog.require('audioCat.ui.widget.PlayWidgetRenderAudioManager');
goog.require('audioCat.ui.widget.Widget');
goog.require('audioCat.ui.widget.templates');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('soy');


/**
 * A widget that controls playing.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates interactions
 *     with the DOM.
 * @param {!audioCat.action.ActionManager} actionManager Manages actions.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {!audioCat.audio.record.MediaRecordManager} recordManager Manages
 *     recording of media.
 * @param {!audioCat.audio.render.AudioRenderer} audioRenderer Renders audio
 *     into a buffer.
 * @param {!audioCat.state.command.CommandManager} commandManager Manages
 *     command history and thus facilitates undo/redo.
 * @param {!audioCat.ui.text.TimeFormatter} timeFormatter Formats time.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.widget.PlayWidget = function(
    domHelper,
    actionManager,
    idGenerator,
    recordManager,
    audioRenderer,
    commandManager,
    timeFormatter) {
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
   * Facilitates command history and thus undo/redo.
   * @private {!audioCat.state.command.CommandManager}
   */
  this.commandManager_ = commandManager;

  var container = /** @type {!Element} */ (
      soy.renderAsFragment(audioCat.ui.widget.templates.PlayWidget));
  goog.base(this, container);

  // TODO(chizeng): Clean up after this class if play widget is ever removed.
  /**
   * The button for recording into a new track using the default audio source.
   * @private {!Element}
   */
  this.defaultAudioRecordButton_ = domHelper.getElementByClassForSure(
      goog.getCssName('defaultAudioSourceRecordButton'), container);
  var playWidgetRecordManager = new audioCat.ui.widget.PlayWidgetRecordManager(
      domHelper,
      actionManager,
      this.defaultAudioRecordButton_,
      recordManager,
      commandManager,
      idGenerator);

  // Displays the current recording time.
  var recordingTimeDisplayer = new audioCat.ui.widget.DefaultRecordTimerWidget(
      domHelper, playWidgetRecordManager, timeFormatter);
  domHelper.appendChild(
      domHelper.getElementByClassForSure(
          goog.getCssName('defaultRecordingTimeDisplay'), container),
      recordingTimeDisplayer.getDom()
    );
};
goog.inherits(audioCat.ui.widget.PlayWidget, audioCat.ui.widget.Widget);
