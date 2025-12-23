from flask import Flask
from .config import Config
from .extentions import cors
from .utils.error_handlers import registor_error_handlers

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app)
    registor_error_handlers(app)

    from .emotion_detection import emotion_detect_bp

    app.register_blueprint(emotion_detect_bp, url_prefix='/api/v1/emotion_detect')
    
    return app