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
goog.provide('audioCat.state.plan.TrackPlan');


/**
 * Describes a track.
 * @typedef {{
 *   1: string,
 *   2: number,
 *   3: number,
 *   4: number,
 *   5: number,
 *   6: !audioCat.state.plan.EnvelopePlan,
 *   7: !Array.<audioCat.state.plan.SectionPlan>,
 *   8: !Array.<audioCat.state.plan.EffectPlan>
 * }}
 */
audioCat.state.plan.TrackPlan = {};

/** @type {number} */
audioCat.state.plan.TrackPlan.TRACK_TITLE = 1;

/** @type {number} */
audioCat.state.plan.TrackPlan.GAIN = 2;

/** @type {number} */
audioCat.state.plan.TrackPlan.PAN = 3;

/** @type {number} */
audioCat.state.plan.TrackPlan.SOLOED = 4;

/** @type {number} */
audioCat.state.plan.TrackPlan.MUTED = 5;

/** @type {number} */
audioCat.state.plan.TrackPlan.VOLUME_ENVELOPE_PLAN = 6;

/** @type {number} */
audioCat.state.plan.TrackPlan.SECTION_PLANS = 7;

/** @type {number} */
audioCat.state.plan.TrackPlan.EFFECT_PLANS = 8;
