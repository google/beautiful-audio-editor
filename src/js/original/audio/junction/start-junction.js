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
goog.provide('audioCat.audio.junction.StartJunction');


/**
 * An interface that all junctions that can be started must implement.
 * @interface
 */
audioCat.audio.junction.StartJunction = function() {};

/**
 * Obtains the raw audio node for this function. Previous junctions can use this
 * to connect.
 * @param {number} time The current time in seconds into the audio at which to
 *     start playing.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to render into. If not
 *     provided, uses the live audio context
 */
audioCat.audio.junction.StartJunction.prototype.start =
    function(time, opt_offlineAudioContext) {};

/**
 * Stops playing of audio. Must be called after the start method has been
 * called for this junction.
 */
audioCat.audio.junction.StartJunction.prototype.stop = function() {};
