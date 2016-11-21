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
"""Contains models such as license keys."""

from google.appengine.ext import db

class LicenseKey(db.Model):
  # Name of the person. Empty string if not provided.
  person_name = db.StringProperty()

  # The email object, ie db.Email("larry@example.com") of the user.
  email = db.EmailProperty()

  # The license key value.
  license_key = db.StringProperty(multiline=True)
 
  # The amount paid for the license.
  amount = db.IntegerProperty()

  # How the user thinks we can improve.
  comments = db.TextProperty()

  # The date and time this entry was created.
  date_created = db.DateTimeProperty(auto_now_add=True)


class AudioRenderErrorLog(db.Model):
  # The date and time this entry was created.
  date_created = db.DateTimeProperty(auto_now_add=True)

  # The switch case that caught this.
  case_category = db.IntegerProperty()

  # The error string.
  message = db.StringProperty()

  # The JS heap size limit at time of error.
  js_heap_size_limit = db.IntegerProperty()

  # The size of used JS heap.
  used_js_heap_size = db.IntegerProperty()

  # The total js heap size.
  total_js_heap_size = db.IntegerProperty()
