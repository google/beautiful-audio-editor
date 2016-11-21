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
goog.provide('audioCat.utility.ArrayHexifier');


/**
 * Converts back and forth between typed arrays and hex strings.
 * Based largely on
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/
 *     Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob()_
 *     and_btoa()_using_TypedArrays_and_UTF-8
 * @constructor
 */
audioCat.utility.ArrayHexifier = function() {};

/**
 * Converts base64 character to uint6.
 * @param {number} nChr The code for the character.
 * @return {number} The character's uint6 representation.
 * @private
 */
audioCat.utility.ArrayHexifier.prototype.b64ToUint6_ = function(nChr) {
  return nChr > 64 && nChr < 91 ?
      nChr - 65 : nChr > 96 && nChr < 123 ?
          nChr - 71 :
          nChr > 47 && nChr < 58 ?
              nChr + 4 :
              nChr === 43 ?
                  62 :
                  nChr === 47 ?
                      63 : 0;
};

/**
 * Converts a base64 string to a UInt8Array.
 * @param {string} sBase64 The hex string.
 * @param {number=} opt_nBlocksSize The block size. Defaults to something
 *     reasonable.
 * @return {!Uint8Array} The array containing the data in the hex.
 * @private
 */
audioCat.utility.ArrayHexifier.prototype.base64DecToArr_ = function(
    sBase64,
    opt_nBlocksSize) {
  var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '');
  var nInLen = sB64Enc.length;
  var nOutLen = opt_nBlocksSize ?
      Math.ceil((nInLen * 3 + 1 >> 2) / opt_nBlocksSize) * opt_nBlocksSize :
      nInLen * 3 + 1 >> 2;
  var taBytes = new Uint8Array(nOutLen);
  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
      nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= this.b64ToUint6_(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }
  return taBytes;
};

/* Base64 string to array encoding */

/**
 * Converts a uint6 to its base64 encoding.
 * @param {number} nUint6 The number to encode in hex.
 * @return {number} The encoding in hex.
 * @private
 */
audioCat.utility.ArrayHexifier.prototype.uint6ToB64_ = function(nUint6) {
  return nUint6 < 26 ?
      nUint6 + 65 :
      nUint6 < 52 ?
          nUint6 + 71 :
          nUint6 < 62 ?
              nUint6 - 4 :
              nUint6 === 62 ?
                  43 :
                  nUint6 === 63 ?
                      47 : 65;
};

/**
 * Base64-encodes an array of unsigned bytes.
 * @param {!Uint8Array} aBytes
 * @return {string} The hex representation of the array's data.
 * @private
 */
audioCat.utility.ArrayHexifier.prototype.base64EncArr_ = function(aBytes) {
  var nMod3 = 2;
  var sB64Enc = '';
  for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += '\r\n'; }
    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(
          this.uint6ToB64_(nUint24 >>> 18 & 63),
          this.uint6ToB64_(nUint24 >>> 12 & 63),
          this.uint6ToB64_(nUint24 >>> 6 & 63),
          this.uint6ToB64_(nUint24 & 63));
      nUint24 = 0;
    }
  }
  return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) +
      (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
};

/**
 * Encodes a Float32Array into a hex string.
 * @param {!Float32Array} arr The array to encode.
 * @return {string} The hex string.
 */
audioCat.utility.ArrayHexifier.prototype.float32ArrayToHex = function(arr) {
    return this.base64EncArr_(new Uint8Array(arr.buffer));
};

/**
 * Converts a hex string into a Float32Array of data the hex represents.
 * @param {string} hex The hex string to decode.
 * @return {!Float32Array} The array with that data.
 */
audioCat.utility.ArrayHexifier.prototype.hexToFloat32Array = function(hex) {
    return new Float32Array(this.base64DecToArr_(hex).buffer);
};
