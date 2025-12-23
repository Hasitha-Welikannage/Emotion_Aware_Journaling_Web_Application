from flask import Flask
from .config import Config
from .extentions import cors
from .emotion.emotion_detection import EmotionDetection
from .utils.error_handlers import registor_error_handlers

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app)
    registor_error_handlers(app)

    from .emotion import emotion_bp

    app.register_blueprint(emotion_bp, url_prefix='/api/v1/emotion_detect')

    with app.app_context():
        EmotionDetection.load_model()
    
    return app