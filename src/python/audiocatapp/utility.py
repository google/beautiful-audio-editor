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
'''Produces responses for various utility purposes like removing slashes.'''

import random
import webapp2


class TrailingSlashRemover(webapp2.RequestHandler):
  '''Redirects URLs ending with / to the same URL without the trailing /.'''
  def get(self, url):
    self.redirect(url)


class RandomReplier(webapp2.RequestHandler):
  '''Returns with a response containing a random integer.'''
  def get(self):
    self.obtainRandomResponse()

  def post(self):
    self.obtainRandomResponse()

  def obtainRandomResponse(self):
    self.response.write(str(random.randint(0, 1000000)))
