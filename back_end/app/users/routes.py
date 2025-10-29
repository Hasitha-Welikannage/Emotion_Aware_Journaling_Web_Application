from flask import request
from flask_login import login_required, current_user
from . import user_bp
from .models import User