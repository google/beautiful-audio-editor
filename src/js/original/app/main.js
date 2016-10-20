/**
 * Main driver for the entire application.
 * @author Chi Zeng, 2014/10/25
 */

goog.provide('app.Main');

goog.require('audioCat.app.App');
goog.require('audioCat.state.Project');
goog.require('audioCat.utility.DomHelper');
goog.require('flags');
goog.require('goog.dom');


(function() {
  var domHelper = new audioCat.utility.DomHelper();
  new audioCat.app.App(
      domHelper,
      new audioCat.state.Project()).render(
          /** @type {!Element} */ (domHelper.getDocument().body));
})();
