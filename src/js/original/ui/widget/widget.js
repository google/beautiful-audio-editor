goog.provide('audioCat.ui.widget.Widget');

goog.require('audioCat.utility.EventTarget');


/**
 * A generic widget that could be placed somewhere in the app UI.
 * @param {!Element} element The DOM element for this widget.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.ui.widget.Widget = function(element) {
  goog.base(this);

  /**
   * @private {!Element}
   */
  this.element_ = element;
};
goog.inherits(audioCat.ui.widget.Widget, audioCat.utility.EventTarget);


/**
 * @return {!Element} The DOM element for this widget.
 */
audioCat.ui.widget.Widget.prototype.getDom = function() {
  return this.element_;
};

/**
 * Cleans up the widget. Widgets with listeners and other entities to be
 * cleaned up should override this method. It's a nop since some widgets do not
 * need to be cleaned up.
 */
audioCat.ui.widget.Widget.prototype.cleanUp = function() {
  this.dispose();
};
