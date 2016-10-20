goog.provide('audioCat.action.Action');


/**
 * Abstractly represents some action that can be done. The UI can make this
 * action happen. An action could be opening the dialog for importing audio for
 * instance. It could also be adding a new track.
 * @constructor
 */
audioCat.action.Action = function() {};

/**
 * Performs the action.
 */
audioCat.action.Action.prototype.doAction = goog.abstractMethod;
