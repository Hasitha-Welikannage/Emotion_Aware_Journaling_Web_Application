from flask import Blueprint

emotion_bp = Blueprint('emotion',__name__)

from . import routes