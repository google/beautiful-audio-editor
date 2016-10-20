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
