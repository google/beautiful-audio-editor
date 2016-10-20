goog.provide('audioCat.state.plan.Constant');
goog.provide('audioCat.state.plan.NumericConstant');


/**
 * Enumerates constants related to encoding and decoding projects.
 * @enum {string}
 */
audioCat.state.plan.Constant = {
  FILE_INITIAL_MARK: 'audioproject',
  PROJECT_EXTENSION: 'audioproject',
  PROJECT_MIME_TYPE: 'application/audioproject'
};

/**
 * Enumerates numeric constants related to encoding and decoding projects.
 * @enum {number}
 */
audioCat.state.plan.NumericConstant = {
  // Leave some buffer room to add new features in project files. How much?
  TOTAL_BUFFER_SPACE_IN_INTS: 20
};
