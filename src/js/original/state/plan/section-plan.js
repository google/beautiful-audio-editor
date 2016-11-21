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
goog.provide('audioCat.state.plan.SectionPlan');


/**
 * Describes how a section of audio should be stored.
 * @typedef {{
 *   1: string,
 *   2: number,
 *   3: audioCat.utility.Id,
 *   4: !Array.<!audioCat.state.plan.ClipPlan>,
 *   5: number
 * }}
 */
audioCat.state.plan.SectionPlan = {};

/** @type {number} */
audioCat.state.plan.SectionPlan.SECTION_TITLE = 1;

/** @type {number} */
audioCat.state.plan.SectionPlan.BEGIN_TIME = 2;

/** @type {number} */
audioCat.state.plan.SectionPlan.AUDIO_CHEST_ID = 3;

/** @type {number} */
audioCat.state.plan.SectionPlan.CLIP_PLANS = 4;

/** @type {number} */
audioCat.state.plan.SectionPlan.PLAYBACK_RATE = 5;
