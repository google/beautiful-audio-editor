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
goog.provide('audioCat.state.effect.field.BooleanField');

goog.require('audioCat.state.effect.field.EventType');
goog.require('audioCat.state.effect.field.Field');
goog.require('audioCat.state.effect.field.FieldCategory');


/**
 * A field that takes on either true or false as values.
 * @param {string} name The name of the field.
 * @param {string} description A description of the field.
 * @param {boolean=} opt_initialValue The initial value. Defaults to false.
 * @constructor
 * @extends {audioCat.state.effect.field.Field}
 */
audioCat.state.effect.field.BooleanField = function(
    name,
    description,
    opt_initialValue) {
  goog.base(this,
      name,
      description,
      '',
      audioCat.state.effect.field.FieldCategory.DISCRETE);

  /**
   * The value of the field.
   * @private {boolean}
   */
  this.value_ = !!opt_initialValue;
};
goog.inherits(audioCat.state.effect.field.BooleanField,
    audioCat.state.effect.field.Field);

/**
 * Sets the value of the field.
 * @param {boolean} value The new value.
 */
audioCat.state.effect.field.BooleanField.prototype.setValue = function(
    value) {
  if (this.value_ != value) {
    this.value_ = value;
    this.dispatchEvent(
        audioCat.state.effect.field.EventType.FIELD_VALUE_CHANGED);
  }
};

/**
 * @return {boolean} The value of the field.
 */
audioCat.state.effect.field.BooleanField.prototype.getValue = function() {
  return this.value_;
};
