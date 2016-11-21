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
goog.provide('audioCat.action.track.ToggleSignatureTimeGridAction');

goog.require('audioCat.action.Action');


/**
 * Toggles whether to make the grid based on time signature or time units.
 * @param {!audioCat.ui.visualization.TimeDomainScaleManager}
 *     timeDomainScaleManager Manages the time-domain scale as well as whether
 *     to display with bars or time units.
 * @param {!audioCat.ui.message.MessageManager} messageManager Issues requests
 *     to display messages to the user.
 * @constructor
 * @extends {audioCat.action.Action}
 */
audioCat.action.track.ToggleSignatureTimeGridAction = function(
    timeDomainScaleManager,
    messageManager) {
  goog.base(this);

  /**
   * @private {!audioCat.ui.visualization.TimeDomainScaleManager}
   */
  this.timeDomainScaleManager_ = timeDomainScaleManager;

  /**
   * @private {!audioCat.ui.message.MessageManager}
   */
  this.messageManager_ = messageManager;
};
goog.inherits(audioCat.action.track.ToggleSignatureTimeGridAction,
    audioCat.action.Action);

/** @override */
audioCat.action.track.ToggleSignatureTimeGridAction.prototype.doAction =
    function() {
  var timeDomainScaleManager = this.timeDomainScaleManager_;
  var newDisplayUsingBarsState =
      !timeDomainScaleManager.getDisplayAudioUsingBars();
  timeDomainScaleManager.setDisplayAudioUsingBars(newDisplayUsingBarsState);

  this.messageManager_.issueMessage(newDisplayUsingBarsState ?
      'The grid is now based on time signature.' :
      'The grid is now based on time units.');
};
