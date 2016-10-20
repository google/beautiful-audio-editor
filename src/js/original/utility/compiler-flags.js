/**
 * @fileoverview Defines custom compiler flags. These flags are global variables
 *     that can be used through the app. Prefix each flag with FLAG_ to avoid
 *     naming conflicts.
 */
goog.provide('flags');


/**
 * @define {boolean} Whether to compile for mobile browers, in which case the
 * compiled binary will be saved as cm.js.
 */
var FLAG_MOBILE = false;
