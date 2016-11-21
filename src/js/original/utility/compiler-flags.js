/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
