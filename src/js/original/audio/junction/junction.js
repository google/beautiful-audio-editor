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
goog.provide('audioCat.audio.junction.Junction');

goog.require('audioCat.audio.junction.JunctionInterface');
goog.require('audioCat.utility.EventTarget');


/**
 * A junction marks a node in the audio graph. The word node was avoided to
 * avoid clobbering namespaces with the HTML5 Web Audio API. A junction usually
 * wraps a node or several nodes.
 *
 * Junctions make use of the composite pattern, so a junction might wrap several
 * junctions inside of it.
 *
 * @param {!audioCat.audio.AudioContextManager} audioContextManager Manages the
 *     audio context.
 * @param {!audioCat.utility.IdGenerator} idGenerator Generates IDs unique
 *     throughout the application.
 * @param {audioCat.audio.junction.Type} junctionType The type of the junction.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 * @implements {audioCat.audio.junction.JunctionInterface}
 */
audioCat.audio.junction.Junction = function(
    audioContextManager,
    idGenerator,
    junctionType) {
  goog.base(this);

  /**
   * Manages audio contexts. Interacts with the web audio API. Available to
   * subclasses. Try to make all interactions with the web audio API go through
   * the Audio Context Manager since we then only have one entry point to change
   * when the web audio API changes, and it changes often.
   * @protected {!audioCat.audio.AudioContextManager}
   */
  this.audioContextManager = audioContextManager;

  /**
   * An ID unique throughout the application.
   * @private {audioCat.utility.Id}
   */
  this.id_ = idGenerator.obtainUniqueId();

  /**
   * The type of the junction.
   * @private {audioCat.audio.junction.Type}
   */
  this.junctionType_ = junctionType;

  /**
   * Junctions that come before this one. Empty for start junctions. Maps from
   * the IDs of junctions to the junctions.
   * @protected {!Object<
   *     audioCat.utility.Id, !audioCat.audio.junction.Junction>}
   */
  this.previousJunctions = {};

  /**
   * The next junction. Null if no such junction.
   * @protected {audioCat.audio.junction.SubsequentJunction}
   */
  this.nextJunction;

  /**
   * Describes whether this junction has been cleaned up already.
   * @protected {boolean}
   */
  this.cleanedUp = false;
};
goog.inherits(audioCat.audio.junction.Junction, audioCat.utility.EventTarget);

/** @override */
audioCat.audio.junction.Junction.prototype.connect = goog.abstractMethod;

/** @override */
audioCat.audio.junction.Junction.prototype.disconnect = function() {
  this.removeNextConnection();
};

/**
 * Removes the next junction from this junction.
 */
audioCat.audio.junction.Junction.prototype.removeNextConnection =
    function() {
  if (this.nextJunction) {
    this.nextJunction.removePreviousJunction(this);
    this.nextJunction = null;
  }
};

/**
 * Establishes previous/next connections. Called by connect.
 * @param {!audioCat.audio.junction.SubsequentJunction} junction The junction to
 *     specify as the next one.
 * @protected
 */
audioCat.audio.junction.Junction.prototype.establishConnections =
    function(junction) {
  this.nextJunction = junction;
  junction.addPreviousJunction(this);
};

/**
 * Removes the next connection. To be called by cleanup.
 * @param {!audioCat.audio.junction.Junction} junction The next junction to
 *     clean up.
 * @protected
 */
audioCat.audio.junction.Junction.prototype.cleanUpNextConnection =
    function(junction) {
  var nextJunction = this.nextJunction;
  if (!nextJunction) {
    return;
  }
  nextJunction.removePreviousJunction(this);
  nextJunction.cleanUp();
  this.nextJunction = null;
};

/** @override */
audioCat.audio.junction.Junction.prototype.getType = function() {
  return this.junctionType_;
};

/** @override */
audioCat.audio.junction.Junction.prototype.getId = function() {
  return this.id_;
};

/** @override */
audioCat.audio.junction.Junction.prototype.addPreviousJunction =
    function(junction) {
  // This should only be called if this junction is a subsequent one.
  this.previousJunctions[junction.getId()] = junction;
  junction.nextJunction =
      /** @type {!audioCat.audio.junction.SubsequentJunction} */ (this);
};

/** @override */
audioCat.audio.junction.Junction.prototype.getNextJunction = function() {
  return this.nextJunction;
};

/** @override */
audioCat.audio.junction.Junction.prototype.removePreviousJunction =
    function(junction) {
  delete this.previousJunctions[junction.getId()];
};

/** @override */
audioCat.audio.junction.Junction.prototype.cleanUp =
    function() {
  return;
};
