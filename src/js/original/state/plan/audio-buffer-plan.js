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
