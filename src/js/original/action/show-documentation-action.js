goog.provide('audioCat.action.ShowDocumentationAction');

goog.require('audioCat.action.Action');
goog.require('audioCat.state.command.CreateEmptyTrackCommand');
goog.require('goog.window');


/**
 * Creates an empty track.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.ShowDocumentationAction = function(
    domHelper) {
};
goog.inherits(audioCat.action.ShowDocumentationAction, audioCat.action.Action);

/** @override */
audioCat.action.ShowDocumentationAction.prototype.doAction = function() {
  // Opens documentation in a new tab.
  goog.window.open('/docs');
};
