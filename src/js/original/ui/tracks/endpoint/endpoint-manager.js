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
goog.provide('audioCat.ui.tracks.endpoint.EndpointManager');

goog.require('audioCat.ui.tracks.endpoint.Endpoint');
goog.require('goog.array');


/**
 * Manages endpoints of audio sections so that we can display them in a compact
 * manner. We stack sections together if they overlap and place try to place
 * them at a level close to the top.
 * @param {!audioCat.state.Track} track A track for which to generate section
 *     endpoints for.
 * @constructor
 */
audioCat.ui.tracks.endpoint.EndpointManager = function(track) {

  var numberOfSections = track.getNumberOfSections();
  var endpoints = new Array(numberOfSections * 2);

  var j = 0;
  for (var i = 0; i < numberOfSections; ++i) {
    // Create initial and final endpoints.
    var section = track.getSectionAtIndexFromBeginning(i);
    endpoints[j++] = this.createEndpoint_(section, false);
    endpoints[j++] = this.createEndpoint_(section, true);
  }

  /**
   * @private {!Array.<!audioCat.ui.tracks.endpoint.Endpoint>}
   */
  this.endpoints_ = endpoints;
  this.sortEndpoints();
};

/**
 * Adds 2 endpoints: the initial and final endpoints of the section. Assumes
 * that the list of endpoints is already sorted. No sorting needed after this.
 * @param {!audioCat.state.Section} section The section to add endpoints for.
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.addSectionEndpoints =
    function(section) {
  var compareFunction = audioCat.ui.tracks.endpoint.Endpoint.compareEndpoints;
  var endpoints = this.endpoints_;
  goog.array.binaryInsert(
      endpoints, this.createEndpoint_(section, false), compareFunction);
  goog.array.binaryInsert(
      endpoints, this.createEndpoint_(section, true), compareFunction);
};

/**
 * Creates a new endpoint.
 * @param {!audioCat.state.Section} section The section that the endpoint
 *     belongs to.
 * @param {boolean} finalState Whether this endpoint is a final one. If not, it
 *     is an initial one.
 * @return {!audioCat.ui.tracks.endpoint.Endpoint} The newly made endpoint.
 * @private
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.createEndpoint_ =
    function(section, finalState) {
  return new audioCat.ui.tracks.endpoint.Endpoint(section, finalState);
};

/**
 * Removes the 2 endpoints associated with a section. Assumes
 * that the list of endpoints is already sorted. No sorting needed after this.
 * @param {!audioCat.state.Section} section The section to add endpoints for.
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.removeSectionEndpoints =
    function(section) {
  var compareFunction = audioCat.ui.tracks.endpoint.Endpoint.compareEndpoints;
  var endpoints = this.endpoints_;

  // Create dummy endpoints for removal purposes.
  goog.array.binaryRemove(
      endpoints, this.createEndpoint_(section, false), compareFunction);
  goog.array.binaryRemove(
      endpoints, this.createEndpoint_(section, true), compareFunction);
};

/**
 * Gets the endpoint at the specified index. Assumes
 * that the list of endpoints is already sorted.
 * @param {number} index The specified index.
 * @return {!audioCat.ui.tracks.endpoint.Endpoint} The endpoint located at that
 *     index. Assumes a sorted list.
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.getEndpointAtIndex =
    function(index) {
  return this.endpoints_[index];
};

/**
 * @return {number} The total number of endpoints.
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.getNumberOfEndpoints =
    function() {
  return this.endpoints_.length;
};

/**
 * Sorts the endpoints by time value, then type (final endpoints take
 * precedence over initial ones), then section ID.
 */
audioCat.ui.tracks.endpoint.EndpointManager.prototype.sortEndpoints =
    function() {
  goog.array.sort(this.endpoints_,
      audioCat.ui.tracks.endpoint.Endpoint.compareEndpoints);
};
