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
goog.provide('audioCat.state.plan.DisplayPlan');


/**
 * Describes how a project should be displayed.
 * @typedef {{
 *   1: number
 * }}
 */
audioCat.state.plan.DisplayPlan = {};

/**
 * Whether to display with time signature. 1 if true. 0 if false.
 * @type {number}
 */
audioCat.state.plan.DisplayPlan.DISPLAY_WITH_TIME_SIGNATURE = 1;
