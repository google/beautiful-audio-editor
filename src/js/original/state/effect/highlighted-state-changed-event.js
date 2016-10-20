goog.provide('audioCat.state.effect.HighlightedStateChangedEvent');

goog.require('audioCat.state.effect.EventType');
goog.require('audioCat.utility.Event');


/**
 * An event fired by an event when its highlighted state changes.
 * @param {boolean} newHighlightedState The new highlighted state.
 * @constructor
 * @extends {audioCat.utility.Event}
 */
audioCat.state.effect.HighlightedStateChangedEvent =
    function(newHighlightedState) {
  goog.base(this,
      audioCat.state.effect.EventType.EFFECT_HIGHLIGHTED_STATE_CHANTED);

  /**
   * @public {boolean}
   */
  this.newHighlightedState = newHighlightedState;
};
goog.inherits(audioCat.state.effect.HighlightedStateChangedEvent,
    audioCat.utility.Event);
