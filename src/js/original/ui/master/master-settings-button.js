goog.provide('audioCat.ui.master.MasterSettingsButton');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A button for toggling whether the master settings panel appears.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {!audioCat.ui.helperPanel.MasterSettingsContentProvider}
 *     masterSettingsContentProvider Provides content that allows the user to
 *     edit master settings.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.MasterSettingsButton = function(
    domHelper,
    masterSettingsContentProvider) {
  var buttonDom = new audioCat.ui.master.MainMasterButton(
      domHelper, 'Settings').getDom();
  goog.base(this, buttonDom);

  // TODO(chizeng): Remove this listener if the master settings button ever goes
  // away.
  domHelper.listenForUpPress(
      buttonDom,
      masterSettingsContentProvider.requestShow,
      false,
      masterSettingsContentProvider);
};
goog.inherits(
    audioCat.ui.master.MasterSettingsButton, audioCat.ui.widget.Widget);
