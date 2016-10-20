goog.provide('audioCat.action.IssueFeatureSupportComplaintAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.ui.dialog.DialogText');
goog.require('goog.asserts');
goog.require('goog.dom.classes');


/**
 * Issue complaints about how certain features are not supported.
 * @param {!audioCat.utility.support.SupportDetector} supportDetector Detects
 *     support for various features and formats.
 * @param {!audioCat.utility.dialog.DialogManager} dialogManager Manages
 *     dialogs.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.IssueFeatureSupportComplaintAction = function(
    supportDetector,
    dialogManager) {
  goog.base(this);

  /**
   * Whether the current browser is supported.
   * @private {boolean}
   */
  this.browserSupported_ = supportDetector.getBrowserSupported();

  /**
   * Whether the web audio API is supported.
   * @private {boolean}
   */
  this.webAudioApiSupported_ = supportDetector.getWebAudioApiSupported();

  /**
   * Whether recording is supported.
   * @private {boolean}
   */
  this.getRecordingSupported_ = supportDetector.getRecordingSupported();

  /**
   * @private {!audioCat.utility.dialog.DialogManager}
   */
  this.dialogManager_ = dialogManager;
};
goog.inherits(audioCat.action.IssueFeatureSupportComplaintAction,
    audioCat.action.Action);

/** @override */
audioCat.action.IssueFeatureSupportComplaintAction.prototype.doAction =
    function() {
  if (this.webAudioApiSupported_ && this.getRecordingSupported_) {
    // Everything's supported. No complaints.
    return;
  }

  var message;
  if (!this.browserSupported_) {
    message = 'Your browser is not supported. ';
  } else if (!this.webAudioApiSupported_) {
    message = 'You cannot use this editor since your browser does not ' +
        'support the web audio API.';
  } else if (!this.getRecordingSupported_) {
    message = 'Note that recording is disabled since your browser does not ' +
        'support microphone recording.';
  }
  goog.asserts.assert(message);

  message += ' To fix this, download a modern browser such as ' +
      '<a href="https://www.google.com/chrome/browser">Google Chrome</a>. We ' +
      'will expand our list of recommended browsers as they become more ' +
      'reliable and adopt audio standards.';

  // Obtain a dialog. Only let users close it if the error is recoverable.
  var dialogManager = this.dialogManager_;
  var recoverable = this.browserSupported_ && this.webAudioApiSupported_;
  // Use a 5ms timeout so that this action is not blocked by the main JS thread.
  goog.global.setTimeout(function() {
    var dialog = dialogManager.obtainDialog(
        message,
        recoverable ? audioCat.ui.dialog.DialogText.CLOSE : null);
    if (recoverable) {
      goog.dom.classes.add(
          dialog.getDom(), goog.getCssName('topBufferedDialog'));
    }
    dialogManager.showDialog(dialog);
  }, 5);
};
