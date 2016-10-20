goog.provide('audioCat.state.plan.EnvelopePlan');


/**
 * Describes how an envelope for some quantity should be displayed.
 * @typedef {{
 *   1: !Array.<!audioCat.state.plan.EnvelopeControlPointPlan>
 * }}
 */
audioCat.state.plan.EnvelopePlan = {};

/** @type {number} */
audioCat.state.plan.EnvelopePlan.CONTROL_POINT_PLANS = 1;
