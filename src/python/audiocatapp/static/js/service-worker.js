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

var cacheVersion = 'CACHE_VERSION_24';

this.addEventListener('install', function(event) {
  // Install the service worker.
  event.waitUntil(
    caches.open(cacheVersion)
      .then(function(cache) {
        console.log('Created an offline cache.');
        return cache.addAll(["/", "/app", "/docs", "/css/static.css", "/js/c.js", "/js/lame.js", "/css/c.css", "/css/index.html", "/images/selectMode.svg", "/images/sadCat.jpg", "/images/forbid.svg", "/images/loadingBackground.gif", "/images/catSnugglingWithToy.jpg", "/images/driveNewProject.jpg", "/images/zoomIn.svg", "/images/snapToGrid.svg", "/images/redoItem.svg", "/images/removeSectionMode.svg", "/images/zoomOut.svg", "/images/volumeControlPoints.png", "/images/featuresPreview.png", "/images/undoItem.svg", "/images/downloadWav.svg", "/images/play.svg", "/images/soloing.png", "/images/downloadMp3.svg", "/images/recordingVoice.png", "/images/favicon.ico", "/images/grayStripes.png", "/images/logo120120.gif", "/images/duplicateSection.svg", "/images/goToBeginning.svg", "/images/mixerView.svg", "/images/pause.svg", "/images/renderToTrack.svg", "/images/playButton.png", "/images/splitSectionMode.svg", "/images/saveToGoogleDrive.svg", "/images/index.html"]);
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
