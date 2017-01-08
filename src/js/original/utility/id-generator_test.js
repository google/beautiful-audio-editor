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
goog.provide('audioCat.utility.IdGeneratorTest');

goog.require('audioCat.utility.IdGenerator');
goog.require('goog.testing.jsunit');

/** @type {audioCat.utility.IdGenerator} */
var idGenerator;

var setUp = function() {
  idGenerator = new audioCat.utility.IdGenerator();
};

var testObtainUniqueId = function() {
  assertEquals(1, idGenerator.obtainUniqueId());
  assertEquals(2, idGenerator.obtainUniqueId());
  assertEquals(3, idGenerator.obtainUniqueId());
};
