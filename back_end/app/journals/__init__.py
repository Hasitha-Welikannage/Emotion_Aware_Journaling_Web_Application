from flask import Blueprint

journals_bp = Blueprint('journals', __name__)

from . import routes