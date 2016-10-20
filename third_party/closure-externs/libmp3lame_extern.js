/**
 * @fileoverview Contains definitions for the js LAME MP3 encoder.
 *
 * @externs
 */

/**
 * The object with which to interact with encoding.
 * @type {!Object}
 */
var Lame = {};

/**
 * A type for the mp3 codec.
 * @constructor
 */
var Mp3CodecType = function() {};

/**
 * A type for the data returned.
 * @constructor
 */
var MoreData = function() {};

/**
 * The data returned.
 * @type {!Float32Array}
 */
MoreData.prototype.data;

/**
 * Initializes LAME.
 * @return {!Mp3CodecType}
 */
Lame.init = function() {};

/**
 * A number denoting stereo.
 * @type {number}
 */
Lame.JOINT_STEREO;

/**
 * Sets the mode for encoding.
 * @param {!Mp3CodecType} mp3codec
 * @param {number} mode
 */
Lame.set_mode = function(mp3codec, mode) {};

/**
 * Sets the number of channels.
 * @param {!Mp3CodecType} mp3codec
 * @param {number} numChannels
 */
Lame.set_num_channels = function(mp3codec, numChannels) {};

/**
 * Sets the sample rate.
 * @param {!Mp3CodecType} mp3codec
 * @param {number} sampleRate
 */
Lame.set_out_samplerate = function(mp3codec, sampleRate) {};

/**
 * Sets the bit rate.
 * @param {!Mp3CodecType} mp3codec
 * @param {number} bitRate
 */
Lame.set_bitrate = function(mp3codec, bitRate) {};

/**
 * Initializes parameters.
 * @param {!Mp3CodecType} mp3codec
 */
Lame.init_params = function(mp3codec) {};

/**
 * Encodes a portion of the audio.
 * @param {!Mp3CodecType} mp3codec
 * @param {!Float32Array} channel0
 * @param {!Float32Array} channel1
 * @return {!MoreData}
 */
Lame.encode_buffer_ieee_float = function(mp3codec, channel0, channel1) {};

/**
 * Flushes more data.
 * @param {!Mp3CodecType} mp3codec
 * @return {!MoreData}
 */
Lame.encode_flush = function(mp3codec) {};

/**
 * Closes the encoder.
 * @param {!Mp3CodecType} mp3codec
 */
Lame.close = function(mp3codec) {};
