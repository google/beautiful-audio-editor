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
