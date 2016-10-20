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
