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
goog.provide('audioCat.utility.WebWorkerManager');


/**
 * Manages web workers.
 * @constructor
 */
audioCat.utility.WebWorkerManager = function() {
};

/**
 * Creates a web worker out of a function. When posted to, the worker calls the
 * given function with the data posted as arguments. After the function runs,
 * the worker posts a message back to the spawner thread with the return value
 * of the function `method` as the only data piece.
 *
 * The function must not rely on other functions - must be completely
 * encapsulated within itself. The function must have a toString() method that
 * returns the string that is the function implementation.
 *
 * If the given method returns a non-falsy value, then the worker will post that
 * result back to the parent thread. Otherwise, nothing will be posted from the
 * worker by this setup, but the method itself may post to the main thread.
 *
 * @param {!Function} method The method to call in the worker.
 * @param {number} numberOfArguments The number of arguments to call the
 *     method with. Post to the returned worker with that many data items.
 * @return {!Worker} A new web worker.
 */
audioCat.utility.WebWorkerManager.prototype.createWorkerFromFunction =
    function(method, numberOfArguments) {
  var argumentsArray = [];
  for (var i = 0; i < numberOfArguments; ++i) {
    argumentsArray.push('e.data[' + i + ']');
  }
  var workerString = 'onmessage=function(e){var r=((' +
      method.toString() + ')(' + argumentsArray.join(',') + '));' +
      'if(r){postMessage(r)}};';

  // Manually generate a javascript file for the worker.
  var workerJsBlob = new Blob([workerString], {type: 'application/javascript'});
  return new Worker(goog.global.URL.createObjectURL(workerJsBlob));
};

/**
 * Terminates a worker. Doing so reclaims precious browser resources.
 * @param {!Worker} worker The worker to terminate.
 */
audioCat.utility.WebWorkerManager.prototype.terminateWorker = function(worker) {
  worker.terminate();
};
