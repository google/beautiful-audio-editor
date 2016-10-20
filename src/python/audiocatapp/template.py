'''Handles templates.'''

import jinja2
import os


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def render(template_name, values={}):
  '''
  Renders a template to a file.
  @param template A string denoting the template path relative to templates.
  @param values A dictionary of values to substitute into the template.
  '''
  t = JINJA_ENVIRONMENT.get_template(template_name)
  return t.render(values)
