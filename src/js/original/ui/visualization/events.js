goog.provide('audioCat.ui.visualization.events');


/**
 * Enumerates events related to visualizations. After adding a new event type,
 * increment the index below. This seems hackish, but I don't see a better way
 * to maintain unique event types at this point.
 * Next available index: 'c'
 * @enum {string}
 */
audioCat.ui.visualization.events = {
  SCORE_TIME_SWAPPED: 'b',
  ZOOM_CHANGED: 'a'
};
