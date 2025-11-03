from flask import Flask
from .config import Config
from .extentions import db, login_manager, migrate, bcrypt
from .users import user_bp
from .auth import auth_bp


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app,db)
    login_manager.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    return app