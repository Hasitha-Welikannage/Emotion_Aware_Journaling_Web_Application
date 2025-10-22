from flask import Flask
from .config import Config
from .extentions import db, login_manager, migrate, bcrypt


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app,db)
    login_manager.init_app(db)
    bcrypt(app)

    @login_manager.user_loader
    def load_user(user_id):
        return None
    
    return app