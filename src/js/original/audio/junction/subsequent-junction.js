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
goog.provide('audioCat.audio.junction.SubsequentJunction');

goog.require('audioCat.audio.junction.JunctionInterface');


/**
 * An interface that all junctions that can be connected to from behind must
 * implment.
 * @interface
 * @extends {audioCat.audio.junction.JunctionInterface}
 */
audioCat.audio.junction.SubsequentJunction = function() {};

/**
 * Obtains the raw audio node for this function. Previous junctions can use this
 * to connect.
 * @param {audioCat.audio.AudioContextManager.NonNullOfflineAudioContext=}
 *     opt_offlineAudioContext The offline audio context to get a raw node from.
 *     If not provided, uses the live audio context.
 * @return {!AudioNode} The raw audio node for this junction.
 */
audioCat.audio.junction.SubsequentJunction.prototype.obtainRawNode =
    function(opt_offlineAudioContext) {};

/**
 * Adds a previous junction. Previous junctions must set this when connecting.
 * It is already implemented by the junction base class in a trivial way, but
 * is meaningless for non-subsequent junctions (that other junctions cannot
 * connect to).
 * @param {!audioCat.audio.junction.Junction} junction The junction to come
 *     before this one.
 */
audioCat.audio.junction.SubsequentJunction.prototype.addPreviousJunction =
    function(junction) {};
