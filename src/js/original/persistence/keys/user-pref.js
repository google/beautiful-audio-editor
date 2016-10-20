goog.provide('audioCat.persistence.keys.UserPref');

/**
 * Enumerates keys in the user pref local storage namespace. Data is stored in
 * local storage in the format "namespace-key".
 * Next available letter (increment upon adding a new entry): 'c'
 * @enum {string}
 */
audioCat.persistence.keys.UserPref = {
  MP3_EXPORT_ENABLED: 'a',
  SCROLL_WHILE_PLAYING_ENABLED: 'b'
};
