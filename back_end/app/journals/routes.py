from flask import request
from flask_login import login_required
from . import journals_bp
from ..utils.response import make_response, make_error
from ..extentions import db
