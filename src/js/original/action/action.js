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
goog.provide('audioCat.action.Action');


/**
 * Abstractly represents some action that can be done. The UI can make this
 * action happen. An action could be opening the dialog for importing audio for
 * instance. It could also be adding a new track.
 * @constructor
 */
audioCat.action.Action = function() {};

/**
 * Performs the action.
 */
audioCat.action.Action.prototype.doAction = goog.abstractMethod;
