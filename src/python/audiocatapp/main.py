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
