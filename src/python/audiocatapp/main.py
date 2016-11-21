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
'''Produces response for home page / other meta static content.'''

import webapp2

import template

class HomePage(webapp2.RequestHandler):
  '''Produces a home page response.'''
  def get(self):
    self.render_home_page()

  def post(self):
    self.render_home_page()

  def render_home_page(self):
    self.response.write(template.render('home.html'))


class AboutPage(webapp2.RequestHandler):
  '''Produces an about page response.'''
  def get(self):
    self.response.write(template.render('about.html'))


class AcknowledgementsPage(webapp2.RequestHandler):
  '''Produces an acknowledgements page response.'''
  def get(self):
    self.response.write(template.render('acknowledgements.html'))


class DocsPage(webapp2.RequestHandler):
  '''Produces an audio editor documentation page response.'''
  def get(self):
    self.response.write(template.render('docs.html'))


class PrivacyPolicyPage(webapp2.RequestHandler):
  '''Produces a privacy policy page response.'''
  def get(self):
    self.response.write(template.render('privacyPolicy.html'))


class UsagePolicyPage(webapp2.RequestHandler):
  '''Produces a usage policy page response.'''
  def get(self):
    self.response.write(template.render('usagePolicy.html'))


class SadCatPage(webapp2.RequestHandler):
  '''Produces a sad cat page response.'''
  def get(self):
    self.response.write(template.render('sadCat.html'))


class SubmitFeedbackPage(webapp2.RequestHandler):
  '''Produces a feedback page response.'''
  def get(self):
    self.response.write(template.render('submitFeedback.html'))
