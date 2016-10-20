goog.provide('audioCat.audio.junction.SubsequentJunction');

goog.require('audioCat.audio.junction.JunctionInterface');


/**
 * An interface that all junctions that can be connected to from behind must
 * implment.
 * @interface
 * @extends {audioCat.audio.junction.JunctionInterface}
 */
audioCat.audio.junction.SubsequentJunction = function() {};

/**
 * Obtains the raw audio node for this function. Previous junctions can use this
 * to connect.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to get a raw node from.
 *     If not provided, uses the live audio context.
 * @return {!AudioNode} The raw audio node for this junction.
 */
audioCat.audio.junction.SubsequentJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {};

/**
 * Adds a previous junction. Previous junctions must set this when connecting.
 * It is already implemented by the junction base class in a trivial way, but
 * is meaningless for non-subsequent junctions (that other junctions cannot
 * connect to).
 * @param {!audioCat.audio.junction.Junction} junction The junction to come
 *     before this one.
 */
audioCat.audio.junction.SubsequentJunction.prototype.addPreviousJunction =
    function(junction) {};
