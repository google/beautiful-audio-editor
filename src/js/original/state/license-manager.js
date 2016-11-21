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
goog.provide('audioCat.state.LicenseManager');

goog.require('audioCat.persistence.LocalStorageKeys');
goog.require('audioCat.state.events');
goog.require('audioCat.utility.EventTarget');
goog.require('goog.string');


/**
 * Manages licensing.
 * @param {!audioCat.service.ServiceManager} serviceManager Manages services.
 * @param {!audioCat.persistence.LocalStorageManager} localStorageManager
 *     Manages local storage.
 * @constructor
 * @extends {audioCat.utility.EventTarget}
 */
audioCat.state.LicenseManager = function(serviceManager, localStorageManager) {
  goog.base(this);

  /**
   * Whether the current user has registered a license.
   * @private {boolean}
   */
  this.registered_ = false;

  /**
   * @private {!audioCat.service.ServiceManager}
   */
  this.serviceManager_ = serviceManager;

  /**
   * @private {!audioCat.persistence.LocalStorageManager}
   */
  this.localStorageManager_ = localStorageManager;

  this.updateRegisteredBasedOnState_();
};
goog.inherits(audioCat.state.LicenseManager, audioCat.utility.EventTarget);

/**
 * Checks if a license is valid.
 * @param {string} license The license to check. May be un-trimmed.
 * @return {boolean} Whether it is valid.
 */
audioCat.state.LicenseManager.prototype.checkLicense = function(license) {
  license = license.trim();
  var nameDivision  = license.split(':');
  if (nameDivision.length != 2) {
    return false;
  }
  var nameValue = nameDivision[0];
  var keyDivision = license.split('Beautiful Audio Editor License ');
  if (keyDivision.length != 2) {
    return false;
  }
  var licenseKeyValue = keyDivision[1];
  if (licenseKeyValue.length != 96) {
    return false;
  }
  var specialNumberString = '';
  for (var i = 0; i < 4; ++i) {
    var charIndex = i * 7 + 5;
    specialNumberString += licenseKeyValue.substring(charIndex, charIndex + 1);
  }
  if (!/^\d+$/.test(specialNumberString)) {
    return false;
  }
  var specialNumber = goog.string.toNumber(specialNumberString);
  if (isNaN(specialNumber) || specialNumber % 13) {
    // Not a number or not divisible by 13.
    return false;
  }
  var nameLengthString = '' + nameValue.length;
  for (var i = 0; i < nameLengthString.length; ++i) {
    if (licenseKeyValue.charCodeAt(33 + i * 3) !=
        nameLengthString.charCodeAt(i)) {
      return false;
    }
  }
  return true;
};

/**
 * @return {boolean} Whether the user is registered.
 */
audioCat.state.LicenseManager.prototype.getRegistered = function() {
  return this.registered_;
};

/**
 * Attempts to register with a given license key.
 * @param {string} license The license to use.
 * @return {boolean} Whether registration succeeded. Or if the user already
 *     registered.
 */
audioCat.state.LicenseManager.prototype.tryToRegister = function(license) {
  if (this.registered_) {
    return true;
  }
  if (this.checkLicense(license)) {
    // Register.
    this.localStorageManager_.set(
        audioCat.persistence.LocalStorageKeys.LICENSE_REGISTERED, '1');
    this.updateRegisteredBasedOnState_();
    return true;
  }
  return false;
};

/**
 * Mark that we have registered ... or not.
 * @param {boolean} registeredState Whether we registered.
 */
audioCat.state.LicenseManager.prototype.setRegistered = function(
    registeredState) {
  if (this.registered_ != registeredState) {
    this.registered_ = registeredState;
    this.dispatchEvent(audioCat.state.events.LICENSE_REGISTRATION_CHANGED);
  }
};

/**
 * Changes whether we are marked as registered or not based on the state.
 * @private
 */
audioCat.state.LicenseManager.prototype.updateRegisteredBasedOnState_ =
    function() {
  this.setRegistered(!!this.localStorageManager_.get(
      audioCat.persistence.LocalStorageKeys.LICENSE_REGISTERED));
};

/**
 * Sends a request that, um, pretends to have to do with registration, but not
 * really ...
 * @param {string} licenseKey The license to send back to the server for this
 *     little ruse. Assumed to be trimmed.
 */
audioCat.state.LicenseManager.prototype.sendPretendRequest =
    function(licenseKey) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/obtainer', true);
  var characterUpperBound = 500;
  if (licenseKey.length > characterUpperBound) {
    licenseKey = licenseKey.substring(0, characterUpperBound);
  }
  xhr.send('l=' + licenseKey);
};
