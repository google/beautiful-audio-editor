goog.provide('audioCat.ui.dragList.DragListGroup');

goog.require('goog.fx.DragListDirection');
goog.require('goog.fx.DragListGroup');


/**
 * A grouping of lists in which elements can be dragged around and also in
 * between different lists.
 * @constructor
 * @extends {goog.fx.DragListGroup}
 */
audioCat.ui.dragList.DragListGroup = function() {
  audioCat.ui.dragList.DragListGroup.base(this, 'constructor');
};
goog.inherits(audioCat.ui.dragList.DragListGroup, goog.fx.DragListGroup);

/**
 * Adds a drag list to the group that grows rightward.
 * @param {!Element} container The element that will contain elements to be
 *     dragged around.
 */
audioCat.ui.dragList.DragListGroup.prototype.addListGrowingRight =
    function(container) {
  this.addDragList(container, goog.fx.DragListDirection.RIGHT);
};
