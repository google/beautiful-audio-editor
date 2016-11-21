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
goog.provide('audioCat.state.plan.AudioBufferPlan');


/**
 * Describes how a native audio buffer should be stored.
 * @typedef {{
 *   1: number,
 *   2: number,
 *   3: string
 * }}
 */
audioCat.state.plan.AudioBufferPlan = {};

/** @type {number} */
audioCat.state.plan.AudioBufferPlan.SAMPLE_RATE = 1;

/** @type {number} */
audioCat.state.plan.AudioBufferPlan.CHANNELS = 3;
