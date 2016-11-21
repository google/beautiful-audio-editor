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
goog.provide('audioCat.state.plan.ProjectPlan');


/**
 * Describes how a project should be stored.
 * @typedef {{
 *   1: string,
 *   2: number,
 *   3: number,
 *   4: !audioCat.state.plan.DisplayPlan,
 *   5: !audioCat.state.plan.TimeSignaturePlan,
 *   6: !Array.<!audioCat.state.plan.TrackPlan>,
 *   7: !Array.<!audioCat.state.plan.EffectPlan>,
 *   8: !Array.<!audioCat.state.plan.AudioChestPlan>
 * }}
 */
audioCat.state.plan.ProjectPlan = {};

/** @type {number} */
audioCat.state.plan.ProjectPlan.NAME = 1;

/** @type {number} */
audioCat.state.plan.ProjectPlan.SAMPLE_RATE = 2;

/** @type {number} */
audioCat.state.plan.ProjectPlan.NUMBER_OF_CHANNELS = 3;

/** @type {number} */
audioCat.state.plan.ProjectPlan.DISPLAY_PLAN = 4;

/** @type {number} */
audioCat.state.plan.ProjectPlan.TIME_SIGNATURE_PLAN = 5;

/** @type {number} */
audioCat.state.plan.ProjectPlan.TRACK_PLANS = 6;

/** @type {number} */
audioCat.state.plan.ProjectPlan.EFFECT_PLANS = 7;

/** @type {number} */
audioCat.state.plan.ProjectPlan.AUDIO_CHEST_PLANS = 8;
