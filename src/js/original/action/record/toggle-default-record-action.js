goog.provide('audioCat.action.record.ToggleDefaultRecordAction');

goog.require('audioCat.action.Action');


/**
 * Toggles default recording. Records if stopped. Stops if recording. Does
 * nothing if the manager is not ready to record.
 * @param {!audioCat.audio.record.MediaRecordManager} mediaRecordManager Manages
 *     recording of media.
 * @param {!audioCat.audio.play.PlayManager} playManager Manages the playing of
 *     audio.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @param {!audioCat.state.prefs.PrefManager} prefManager Manages user
 *     preferences.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.record.ToggleDefaultRecordAction = function(
    mediaRecordManager,
    playManager,
    messageManager,
    prefManager) {
  goog.base(this);
  /**
   * @private {!audioCat.audio.record.MediaRecordManager}
   */
  this.mediaRecordManager_ = mediaRecordManager;

  /**
   * @private {!audioCat.audio.play.PlayManager}
   */
  this.playManager_ = playManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;

  /**
   * @private {!audioCat.state.prefs.PrefManager}
   */
  this.prefManager_ = prefManager;

  /**
   * The current recording job. Null if not recording.
   * @private {audioCat.audio.record.RecordingJob}
   */
  this.recordingJob_ = null;
};
goog.inherits(
    audioCat.action.record.ToggleDefaultRecordAction, audioCat.action.Action);

/** @override */
audioCat.action.record.ToggleDefaultRecordAction.prototype.doAction =
    function() {
  var mediaRecordManager = this.mediaRecordManager_;
  var playManager = this.playManager_;
  var prefManager = this.prefManager_;
  if (mediaRecordManager.getDefaultRecordingReadyState()) {
    // Only record if we're ready to do so.
    if (this.recordingJob_) {
      // Stop the current recording.
      this.recordingJob_.stop();
      this.recordingJob_ = null;
      this.messageManager_.issueMessage('Recording ended.');
    } else {
      // Begin recording.
      // Possibly play audio here.
      if (prefManager.getPlayWhileRecording()) {
        if (playManager.getPlayState()) {
          if (prefManager.getPlaceNewRecordingAtBeginning()) {
            playManager.pause();
          }
        }

        // Set the play time to 0 before playing if we're recording from start.
        if (prefManager.getPlaceNewRecordingAtBeginning()) {
          playManager.setTime(0);
        }
        if (!playManager.getPlayState()) {
          // We could have paused earlier, but might already be playing.
          playManager.play();
        }
      }

      if (playManager.getPlayState()) {
        // If the user ever pauses, stop recording too to avoid confusion.
        playManager.listenOnce(audioCat.audio.play.events.PAUSED,
            function() {
              if (this.recordingJob_) {
                // We are recording. Stop after the pause.
                this.doAction();
              }
            }, false, this);
      }

      // Start a new recording.
      var sectionBeginTime = prefManager.getPlaceNewRecordingAtBeginning() ?
          0 : playManager.getTime();
      this.recordingJob_ = mediaRecordManager.createDefaultRecordingJob(
          prefManager.getChannelsForRecording(), sectionBeginTime);

      // Possibly inform the media record manager to make the section possibly
      // have a begin time.
      this.recordingJob_.start();
      this.messageManager_.issueMessage('Now recording.');
    }
  }
};
