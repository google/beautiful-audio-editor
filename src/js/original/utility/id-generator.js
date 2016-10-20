goog.provide('audioCat.utility.Id');
goog.provide('audioCat.utility.IdGenerator');


/** @typedef {number} */
audioCat.utility.Id;


/**
 * Generates successive unique integer IDs. Only works if program is
 * single-threaded.
 * @constructor
 */
audioCat.utility.IdGenerator = function() {
  /**
   * The previously available ID. Used to generate the next ID.
   * @private {number}
   */
  this.previousAvailableId_ = 0;
};

/**
 * Generates a different unique ID each time called, and returns it.
 * @return {audioCat.utility.Id} A new unique ID.
 */
audioCat.utility.IdGenerator.prototype.obtainUniqueId = function() {
  return /** @type {audioCat.utility.Id} */ (++(this.previousAvailableId_));
};
