/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
