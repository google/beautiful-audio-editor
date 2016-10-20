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
