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
goog.provide('audioCat.android.AndroidAmbassador');

goog.require('audioCat.android.StringConstant');
goog.require('goog.asserts');


/**
 * Interfaces with the object that Android injects into javascript. Should only
 * be constructed in an Android web view.
 * @constructor
 */
audioCat.android.AndroidAmbassador = function() {
  /**
   * The global Android object.
   * @private {!Object}
   */
  this.androidObject_ =
      goog.global[audioCat.android.StringConstant.ANDROID_OBJECT];
  goog.asserts.assert(this.androidObject_, 'No Android object found.');

  // Now that we have a reference to the object, remove its global reference to
  // prevent tampering by hackers. :)
  delete goog.global[audioCat.android.StringConstant.ANDROID_OBJECT];
};

/**
 * Registers the beginning of an audio file write to the Android file system.
 * @param {string} fileName The name of the file.
 * @param {string} mimeType The mime type of the audio file.
 * @param {number} fileSize the size in bytes of the file.
 */
audioCat.android.AndroidAmbassador.prototype.registerAudioFileWrite = function(
    fileName,
    mimeType,
    fileSize) {
  this.androidObject_[
      audioCat.android.StringConstant.REGISTER_AUDIO_FILE_WRITE](
          fileName, mimeType, fileSize);
};

/**
 * Registers the beginning of a project file write to the Android file system.
 * @param {string} fileName The name of the file.
 * @param {string} mimeType The mime type of the file.
 * @param {number} fileSize the size in bytes of the file.
 */
audioCat.android.AndroidAmbassador.prototype.registerProjectFileWrite =
    function(
        fileName,
        mimeType,
        fileSize) {
  this.androidObject_[
      audioCat.android.StringConstant.REGISTER_PROJECT_FILE_WRITE](
          fileName, mimeType, fileSize);
};

/**
 * Signals to Android to start writing the previously registered file writing
 * operation.
 */
audioCat.android.AndroidAmbassador.prototype.startWritingFile = function() {
  this.androidObject_[audioCat.android.StringConstant.WRITE_FILE]();
};

/**
 * Signals to Android to clean up after the previous file write attempt.
 */
audioCat.android.AndroidAmbassador.prototype.cleanUpPreviousFileWrite =
    function() {
  this.androidObject_[
      audioCat.android.StringConstant.CLEAN_UP_FILE_WRITE_ATTEMPT]();
};


/**
 * Sets the next input type.
 * @param {audioCat.android.FileInputType} inputType The next input type.
 */
audioCat.android.AndroidAmbassador.prototype.setNextInputType = function(
    inputType) {
  this.androidObject_[audioCat.android.StringConstant.SET_NEXT_FILE_INPUT_TYPE](
      inputType);
};

/**
 * @return {string} The hostname + port string for writing files to disk.
 */
audioCat.android.AndroidAmbassador.prototype.getFileWritingSocketString =
    function() {
  return this.androidObject_[
      audioCat.android.StringConstant.GET_FILE_WRITING_SOCKET]();
};
