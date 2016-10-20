goog.provide('audioCat.persistence.LocalStorageNamespace');


/**
 * Enumerates keys used for local storage. Increment the symbol below after
 * adding a new key to maintain unique keys. Note: You are encouraged to use the
 * "namespace-key" format instead of values from this enum.
 * Next available key: 'd'
 * @enum {string}
 */
audioCat.persistence.LocalStorageNamespace = {
  USER_DATA: 'c',
  USER_PREF: 'b' // Having to do with user preferences.
};
