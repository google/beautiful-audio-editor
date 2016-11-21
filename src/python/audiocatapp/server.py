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
    ('/usagePolicy', main.UsagePolicyPage),
    ('/submitFeedback', main.SubmitFeedbackPage),

    # URL endpoint for logging render errors.
    ('/renderError', error_logging.LogRenderErrorEndpoint),

    # A sad cat. Because.
    ('/sadCat', main.SadCatPage),

    ('/', main.HomePage),
  ], debug=False)
