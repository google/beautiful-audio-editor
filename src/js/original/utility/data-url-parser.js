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
