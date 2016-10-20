goog.provide('audioCat.audio.junction.StartJunction');


/**
 * An interface that all junctions that can be started must implement.
 * @interface
 */
audioCat.audio.junction.StartJunction = function() {};

/**
 * Obtains the raw audio node for this function. Previous junctions can use this
 * to connect.
 * @param {number} time The current time in seconds into the audio at which to
 *     start playing.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to render into. If not
 *     provided, uses the live audio context
 */
audioCat.audio.junction.StartJunction.prototype.start =
    function(time, opt_offlineAudioContext) {};

/**
 * Stops playing of audio. Must be called after the start method has been
 * called for this junction.
 */
audioCat.audio.junction.StartJunction.prototype.stop = function() {};
