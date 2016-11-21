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
goog.provide('audioCat.state.effect.field.EventType');


/**
 * Enumerates events related to fields. Increment the letter below upon adding
 * a new entry here.
 * Next available letter: 'd'
 */
audioCat.state.effect.field.EventType = {
  FIELD_DESCRIPTION_CHANGED: 'a',
  FIELD_VALUE_CHANGED: 'b',
  FIELD_STABLE_VALUE_CHANGED: 'c'
};
