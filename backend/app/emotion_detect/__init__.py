from flask import Blueprint

emotion_bp = Blueprint("emotions", __name__)

from . import routes