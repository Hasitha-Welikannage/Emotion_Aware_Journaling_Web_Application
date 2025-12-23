from flask import Blueprint

emotion_detect_bp = Blueprint('emotion_detect',__name__)

from . import routes