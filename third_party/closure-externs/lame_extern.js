/**
 * @fileoverview Extern for mp3 generating library.
 */


/**
 * A lame js object that allows access into the rest of the library.
 * @constructor
 */
var lamejs = function() {};


/**
 * An object responsible for a single run of encoding.
 * @param {number} channels The number of channels.
 * @param {number} sampleRate The sample rate.
 * @param {number} quality The quality of the mp3 (like 128 kbps for instance).
 * @constructor
 */
lamejs.Mp3Encoder = function(channels, sampleRate, quality) {};


/**
 * Encodes 2 buffers.
 * @param {!ArrayBufferView} left The left channel.
 * @param {!ArrayBufferView=} opt_right The optional right channel.
 * @return {!Int8Array} Encoded mp3 data.
 */
lamejs.Mp3Encoder.prototype.encodeBuffer = function(left, opt_right) {};


/**
 * @return {!Int8Array} The rest of the mp3 data needed to generate the file.
 */
lamejs.Mp3Encoder.prototype.flush = function() {};
