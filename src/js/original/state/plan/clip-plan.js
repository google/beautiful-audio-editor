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
goog.provide('audioCat.state.plan.ClipPlan');


/**
 * Describes how a clip of audio should be stored.
 * @typedef {{
 *   1: number,
 *   2: number
 * }}
 */
audioCat.state.plan.ClipPlan = {};

/** @type {number} */
audioCat.state.plan.ClipPlan.BEGIN_SAMPLE = 1;

/** @type {number} */
audioCat.state.plan.ClipPlan.RIGHT_BOUND_SAMPLE = 2;
