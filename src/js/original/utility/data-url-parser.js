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
goog.provide('audioCat.utility.DataUrlParser');


/**
 * Parses data URLs.
 * @constructor
 */
audioCat.utility.DataUrlParser = function() {

};

/**
 * Parses a data URL from a FileReader.
 * @param {string} dataUrl The data URL.
 * @return {Array.<string, string>} An array of 2 items. Or null if the data URL
 *     could not be parsed. If the array is non-null, the first item is the
 *     mime-type. The second item is the hex encoding of the file data.
 */
audioCat.utility.DataUrlParser.prototype.parseDataUrl = function(dataUrl) {
  var matches = dataUrl.match(/^data:([\w-]+\/[\w-]+);base64,(.*)$/);
  return (matches.length >= 3) ? [matches[1], matches[2]] : null;
};
