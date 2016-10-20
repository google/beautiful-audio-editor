goog.provide('audioCat.ui.master.MainMasterButton');

goog.require('audioCat.ui.widget.Widget');
goog.require('goog.dom.classes');


/**
 * A generic button for some UI bar like the footer. For now, just used in the
 * footer.
 * @param {!audioCat.utility.DomHelper} domHelper Facilitates DOM interactions.
 * @param {string} content The content of the string.
 * @constructor
 * @extends {audioCat.ui.widget.Widget}
 */
audioCat.ui.master.MainMasterButton = function(domHelper, content) {
  var divTagName = 'div';
  var baseElement = domHelper.createElement(divTagName);
  goog.dom.classes.add(baseElement, goog.getCssName('footerMainButton'));
  goog.base(this, baseElement);

  var backgroundElement = domHelper.createElement(divTagName);
  goog.dom.classes.add(backgroundElement, goog.getCssName('backgroundElement'));
  domHelper.appendChild(baseElement, backgroundElement);

  var contentContainer = domHelper.createElement('span');
  domHelper.setTextContent(contentContainer, content);
  domHelper.appendChild(baseElement, contentContainer);
};
goog.inherits(audioCat.ui.master.MainMasterButton, audioCat.ui.widget.Widget);
