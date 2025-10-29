from flask import request
from flask_login import login_user, logout_user, login_required, current_user
from . import auth_bp
from ..extentions import db
from ..users.models import User