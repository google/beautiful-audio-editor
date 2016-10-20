goog.provide('audioCat.persistence.keys.UserData');

/**
 * Enumerates keys in the user data local storage namespace. Data is stored in
 * local storage in the format "namespace-key". This namespace could contain
 * personal user data.
 * Next available letter (increment upon adding a new entry): 'b'
 * @enum {string}
 */
audioCat.persistence.keys.UserData = {
  EMAIL: 'a'
};
