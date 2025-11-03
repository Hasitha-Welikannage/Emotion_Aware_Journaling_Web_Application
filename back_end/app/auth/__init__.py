from flask import Blueprint
from ..extentions import login_manager
from ..users.models import User

auth_bp = Blueprint('auth', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

from . import routes