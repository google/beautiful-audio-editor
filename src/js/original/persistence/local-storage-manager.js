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
goog.provide('audioCat.persistence.LocalStorageManager');

goog.require('goog.storage.mechanism.HTML5LocalStorage');


/**
 * Manages local storage.
 * @constructor
 */
audioCat.persistence.LocalStorageManager = function() {
  /**
   * Interfaces with local storage.
   * @private {!goog.storage.mechanism.HTML5LocalStorage}
   */
  this.closureLocalStorageUtility_ =
      new goog.storage.mechanism.HTML5LocalStorage();
};


/**
 * Gets a value.
 * @param {string} key The key of the value.
 * @return {?string} The value or null if it does not exist.
 */
audioCat.persistence.LocalStorageManager.prototype.get = function(key) {
  return this.closureLocalStorageUtility_.get(key);
};

/**
 * Sets a value.
 * @param {string} key The key of the value.
 * @param {string} value The value to set.
 */
audioCat.persistence.LocalStorageManager.prototype.set = function(key, value) {
  this.closureLocalStorageUtility_.set(key, value);
};

/**
 * Removes a value.
 * @param {string} key The key to remove.
 */
audioCat.persistence.LocalStorageManager.prototype.remove = function(key) {
  this.closureLocalStorageUtility_.remove(key);
};

/**
 * Sets a local storage value based on the namespace and key.
 * @param {audioCat.persistence.LocalStorageNamespace} namespace
 * @param {string} key
 * @param {string} value
 */
audioCat.persistence.LocalStorageManager.prototype.setForNamespace = function(
    namespace, key, value) {
  this.set(this.createCollectiveKey_(namespace, key), value);
};

/**
 * Gets a local storage value based on the namespace and key.
 * @param {audioCat.persistence.LocalStorageNamespace} namespace
 * @param {string} key
 * @return {?string} value
 */
audioCat.persistence.LocalStorageManager.prototype.getFromNamespace = function(
    namespace, key) {
  return this.get(this.createCollectiveKey_(namespace, key));
};

/**
 * Removes a value given a namespace and key.
 * @param {audioCat.persistence.LocalStorageNamespace} namespace
 * @param {string} key The key to remove.
 */
audioCat.persistence.LocalStorageManager.prototype.removeFromNamespace =
    function(namespace, key) {
  this.remove(this.createCollectiveKey_(namespace, key));
};

/**
 * Creates a collective local storage key from a namespace and inner key.
 * @param {audioCat.persistence.LocalStorageNamespace} namespace
 * @param {string} key The key within that namespace.
 * @return {string} The collective key for local storage.
 * @private
 */
audioCat.persistence.LocalStorageManager.prototype.createCollectiveKey_ =
    function(namespace, key) {
  return namespace + '-' + key;
};
