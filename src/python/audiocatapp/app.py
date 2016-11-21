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
'''Produces the content for an app.'''

import app_content

import re
import webapp2


# Use this regex to return different HTML content based on mobile or Desktop.
USER_AGENT_REGEX = re.compile('Android|iPhone|iPod|iPad|Silk')


class AppPage(webapp2.RequestHandler):
  '''Produces a response that renders the main app.'''
  def get(self):
    if USER_AGENT_REGEX.search(self.request.headers.get('User-Agent', '')):
      self.response.write(app_content.MOBILE_APP_CONTENT)
    else:
      self.response.write(app_content.DESKTOP_APP_CONTENT)
