goog.provide('audioCat.persistence.LocalStorageKeys');


/**
 * Enumerates keys used for local storage. Increment the symbol below after
 * adding a new key to maintain unique keys. Note: You are encouraged to use the
 * "namespace-key" format instead of values from this enum.
 * Next available key: 'b'
 * @enum {string}
 */
audioCat.persistence.LocalStorageKeys = {
  LICENSE_REGISTERED: 'a' // Whether the user registered a license.
};
