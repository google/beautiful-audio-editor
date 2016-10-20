goog.provide('audioCat.state.plan.TimeSignaturePlan');


/**
 * Describes the time signature of a project.
 * @typedef {{
 *   1: number,
 *   2: number
 * }}
 */
audioCat.state.plan.TimeSignaturePlan = {};

/** @type {number} */
audioCat.state.plan.TimeSignaturePlan.BEATS = 1;

/** @type {number} */
audioCat.state.plan.TimeSignaturePlan.NOTE_NUMBER = 2;
