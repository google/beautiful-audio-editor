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
