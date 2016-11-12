'''Serves the app.'''

import webapp2

import app
import error_logging
import main
import utility


app = webapp2.WSGIApplication([
    ('(.+)/$', utility.TrailingSlashRemover),
    ('/acknowledgements', main.AcknowledgementsPage),
    ('/app', app.AppPage),

    # Using the introduction endpoint will take users to a brief tutorial.
    ('/introduction', app.AppPage),
    
    ('/about', main.AboutPage),
    ('/docs', main.DocsPage),
    ('/privacyPolicy', main.PrivacyPolicyPage),
    ('/submitFeedback', main.SubmitFeedbackPage),

    # URL endpoint for logging render errors.
    ('/renderError', error_logging.LogRenderErrorEndpoint),

    # A sad cat. Because.
    ('/sadCat', main.SadCatPage),

    ('/', main.HomePage),
  ], debug=False)
