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
  * Contains an uncompiled script that starts a service worker, which allows for
  * offline use of the app.
  */

// NOTE(chizeng): UPPERCASE constants are preprocessed (replaced
// with actual values) during building.

var cacheVersion = 'CACHE_VERSION_25';

this.addEventListener('install', function(event) {
  // Install the service worker.
  event.waitUntil(
    caches.open(cacheVersion)
      .then(function(cache) {
        console.log('Created an offline cache.');
        return cache.addAll(["/", "/app", "/docs", "/css/static.css", "/js/c.js", "/js/cm.js", "/js/lame.js", "/css/c.css", "/css/cm.css", "/css/index.html", "/images/catSnugglingWithToy.jpg", "/images/downloadMp3.svg", "/images/downloadWav.svg", "/images/driveNewProject.jpg", "/images/duplicateSection.svg", "/images/favicon.ico", "/images/featuresPreview.png", "/images/forbid.svg", "/images/goToBeginning.svg", "/images/grayStripes.png", "/images/index.html", "/images/loadingBackground.gif", "/images/logo120120.gif", "/images/mixerView.svg", "/images/pause.svg", "/images/play.svg", "/images/playButton.png", "/images/recordingVoice.png", "/images/redoItem.svg", "/images/removeSectionMode.svg", "/images/renderToTrack.svg", "/images/sadCat.jpg", "/images/saveToGoogleDrive.svg", "/images/selectMode.svg", "/images/snapToGrid.svg", "/images/soloing.png", "/images/splitSectionMode.svg", "/images/undoItem.svg", "/images/volumeControlPoints.png", "/images/zoomIn.svg", "/images/zoomOut.svg"]);
      })
  );
});


this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        return caches.open(cacheVersion).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });  
      });
    })
  );
});
