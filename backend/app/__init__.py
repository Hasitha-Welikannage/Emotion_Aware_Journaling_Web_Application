from flask import Flask
from .config import Config
from .extentions import db, login_manager, migrate, bcrypt, cors
from .utils.error_handlers import registor_error_handlers


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app,db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, origins=["http://localhost:3000"])

    login_manager.login_view = None
    registor_error_handlers(app, login_manager)

    from .users import user_bp
    from .auth import auth_bp
    from .emotion_detect import emotion_bp
    from .journals import journals_bp

    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(journals_bp, url_prefix='/journals')
    app.register_blueprint(emotion_bp)
    
    return app