goog.provide('audioCat.audio.junction.JunctionInterface');


/**
 * A junction marks a node in the audio graph. The word node was avoided to
 * avoid clobbering namespaces with the HTML5 Web Audio API. A junction usually
 * wraps a node or several nodes. This interface specifies certain functions
 * that every junction must implement.
 * @interface
 */
audioCat.audio.junction.JunctionInterface = function() {};

/**
 * Makes the argument junction the subsequent junction that this one is
 * connected to.
 * @param {!audioCat.audio.junction.SubsequentJunction} junction The junction to
 *     specify as the next one.
 */
audioCat.audio.junction.JunctionInterface.prototype.connect =
    function(junction) {};

/**
 * Disconnects the next node. Could be overriden. Effects in particular need to
 * override this since they are re-ordered frequently.
 */
audioCat.audio.junction.JunctionInterface.prototype.disconnect = function() {};

/**
 * @return {audioCat.audio.junction.Type} The type of the junction.
 */
audioCat.audio.junction.JunctionInterface.prototype.getType = function() {};

/**
 * @return {audioCat.utility.Id} The ID of the junction. Unique throughout the
 *     application.
 */
audioCat.audio.junction.JunctionInterface.prototype.getId = function() {};

/**
 * @return {audioCat.audio.junction.SubsequentJunction} The next junction or
 *     null if there is none.
 */
audioCat.audio.junction.JunctionInterface.prototype.getNextJunction =
    function() {};

/**
 * Adds a previous junction. Previous junctions must set this when connecting.
 * @param {!audioCat.audio.junction.Junction} junction The junction to come
 *     before this one.
 */
audioCat.audio.junction.JunctionInterface.prototype.addPreviousJunction =
    function(junction) {};

/**
 * Removes a previous junction. Used during cleanup.
 * @param {!audioCat.audio.junction.Junction} junction The junction to remove
 *     as coming before this one.
 */
audioCat.audio.junction.JunctionInterface.prototype.removePreviousJunction =
    function(junction) {};

/**
 * Cleans up a junction upon being removed. For instance, disconnects and
 * removes listeners. To be overriden.
 */
audioCat.audio.junction.JunctionInterface.prototype.cleanUp = function() {};
