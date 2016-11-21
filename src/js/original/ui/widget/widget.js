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
