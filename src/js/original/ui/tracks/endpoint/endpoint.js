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
goog.provide('audioCat.ui.tracks.endpoint.Endpoint');


/**
 * An endpoint of a section of audio. Used to create stacked visualizations of
 * audio sections.
 * @param {!audioCat.state.Section} section The section that this endpoint
 *     pertains to.
 * @param {boolean} finalEndpointStatus Whether this is a final endpoint. If
 *     not, then it is an initial endpoint.
 * @constructor
 */
audioCat.ui.tracks.endpoint.Endpoint = function(
    section,
    finalEndpointStatus) {
  /**
   * @private {!audioCat.state.Section}
   */
  this.section_ = section;

  /**
   * True iff this is a final endpoint. Otherwise, this is an initial endpoint.
   * @private {boolean}
   */
  this.finalEndpointStatus_ = finalEndpointStatus;
};


/**
 * Compares 2 endpoints by value, then by initial state (final endpoints take
 * precedence), then by section ID. This should be a strictly increasing
 * comparison. No 2 endpoints should be equal.
 * @param {!audioCat.ui.tracks.endpoint.Endpoint} endpoint1
 * @param {!audioCat.ui.tracks.endpoint.Endpoint} endpoint2
 * @return {number} -1 if the 1st is less than, 1 if the 1st is greater than,
 *     and 0 if both are equal.
 */
audioCat.ui.tracks.endpoint.Endpoint.compareEndpoints =
    function(endpoint1, endpoint2) {
  if (endpoint1.getValue() != endpoint2.getValue()) {
    return endpoint1.getValue() - endpoint2.getValue();
  }
  if (endpoint1.isFinalEndpoint() != endpoint2.isFinalEndpoint()) {
    // Final endpoints take precendence.
    return endpoint1.isFinalEndpoint() ? -1 : 1;
  }
  // If all fails, use the section ID to differentiate endpoints.
  return endpoint1.getSection().getId() - endpoint2.getSection().getId();
};

/**
 * @return {!audioCat.state.Section}
 */
audioCat.ui.tracks.endpoint.Endpoint.prototype.getSection = function() {
  return this.section_;
};

/**
 * @return {number} The time value of the endpoint. This varies based on whether
 *     this endpoint is an initial or a final one.
 */
audioCat.ui.tracks.endpoint.Endpoint.prototype.getValue = function() {
  var section = this.section_;
  var value = section.getBeginTime();
  if (this.finalEndpointStatus_) {
    value += section.getDuration();
  }
  return value;
};

/**
 * @return {boolean} Whether this is a final endpoint. Otherwise, it is an
 *     initial endpoint.
 */
audioCat.ui.tracks.endpoint.Endpoint.prototype.isFinalEndpoint = function() {
  return this.finalEndpointStatus_;
};
