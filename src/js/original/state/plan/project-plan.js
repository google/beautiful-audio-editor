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
