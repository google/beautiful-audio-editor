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
/**
 * Main driver for the entire application.
 * @author Chi Zeng, 2014/10/25
 */

goog.provide('app.Main');

goog.require('audioCat.app.App');
goog.require('audioCat.state.Project');
goog.require('audioCat.utility.DomHelper');
goog.require('flags');
goog.require('goog.dom');


(function() {
  var domHelper = new audioCat.utility.DomHelper();
  new audioCat.app.App(
      domHelper,
      new audioCat.state.Project()).render(
          /** @type {!Element} */ (domHelper.getDocument().body));

  // Try to register a service worker.
  if ('serviceWorker' in goog.global.navigator) {
    goog.global.navigator['serviceWorker']['register']('/service-worker.js')[
        'then'](function() {
      // registration worked
      goog.global.console.log('Caching the editor for offline use ...');
    })['catch'](function(error) {
      // registration failed
      goog.global.console.log('Could not cache the editor for offline use. ' +
          'Try using Google Chrome.');
    });
  }
})();
