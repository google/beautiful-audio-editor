goog.provide('audioCat.android.StringConstant');


/**
 * Enumerates string constants related to Android.
 * @enum {string}
 */
audioCat.android.StringConstant = {
  CLEAN_UP_FILE_WRITE_ATTEMPT: 'f', // Method for cleaning up after file write.
  SET_NEXT_FILE_INPUT_TYPE: 'a', // Method for setting the next file input type.
  REGISTER_PROJECT_FILE_WRITE: 'b', // Method for registering project f write.
  REGISTER_AUDIO_FILE_WRITE: 'c', // Method for registering audio file write.
  GET_FILE_WRITING_SOCKET: 'd', // Returns host + port string for socket.
  WRITE_FILE: 'e', // Method for triggering actual file write.
  ANDROID_OBJECT: '__and__' // The global name of the android object.
};
