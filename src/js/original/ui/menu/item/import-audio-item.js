goog.provide('audioCat.ui.menu.item.ImportAudioItem');

goog.require('audioCat.ui.menu.item.MenuItem');
goog.require('goog.ui.Component.EventType');


/**
 * The menu item for importing a new track of audio.
 * @param {!audioCat.action.RequestAudioImportAction} requestImportAudioAction
 *     An action for requesting audio import.
 * @constructor
 * @extends {audioCat.ui.menu.item.MenuItem}
 */
audioCat.ui.menu.item.ImportAudioItem =
    function(requestImportAudioAction) {
  goog.base(this, 'Import local sound file.');

  /**
   * The action for requesting audio import.
   * @private {!audioCat.action.RequestAudioImportAction}
   */
  this.requestImportAudioAction_ = requestImportAudioAction;

  this.listen(
      goog.ui.Component.EventType.ACTION, this.handleClick_, false, this);
};
goog.inherits(audioCat.ui.menu.item.ImportAudioItem,
    audioCat.ui.menu.item.MenuItem);

/**
 * Handles a click event.
 * @private
 */
audioCat.ui.menu.item.ImportAudioItem.prototype.handleClick_ = function() {
  this.requestImportAudioAction_.doAction();
};
