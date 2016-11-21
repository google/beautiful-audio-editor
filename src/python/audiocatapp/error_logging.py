# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
'''Produces response for logging-related endpoints.'''

import webapp2

import models

class LogRenderErrorEndpoint(webapp2.RequestHandler):
  '''Produces a home page response.'''

  def post(self):
    error_log = models.AudioRenderErrorLog(
        message = self.request.headers.get('error_message', '-2'),
        case_category = \
            int(self.request.headers.get('case_category', '-2')),
        js_heap_size_limit = \
            int(self.request.headers.get('js_heap_size_limit', '-2')),
        used_js_heap_size = \
            int(self.request.headers.get('used_js_heap_size', '-2')),
        total_js_heap_size = \
            int(self.request.headers.get('total_js_heap_size', '-2'))
      )
    error_log.put()
    self.response.write('')
