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
