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
