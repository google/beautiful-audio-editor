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
goog.provide('audioCat.state.plan.AudioChestPlan');


/**
 * Describes how a chest of audio should be stored.
 * @typedef {{
 *   1: string,
 *   2: audioCat.utility.Id,
 *   3: audioCat.audio.AudioOrigination,
 *   4: number,
 *   5: number,
 *   6: number
 * }}
 */
audioCat.state.plan.AudioChestPlan = {};

/** @type {number} */
audioCat.state.plan.AudioChestPlan.TITLE = 1;

/** @type {number} */
audioCat.state.plan.AudioChestPlan.FORMER_ID = 2;

/** @type {number} */
audioCat.state.plan.AudioChestPlan.ORIGINATION = 3;

/** @type {number} */
audioCat.state.plan.AudioChestPlan.SAMPLE_RATE = 4;

/** @type {number} */
audioCat.state.plan.AudioChestPlan.SAMPLE_LENGTH = 5;

/** @type {number} */
audioCat.state.plan.AudioChestPlan.NUMBER_OF_CHANNELS = 6;
