from flask import request
from . import emotion_bp
from .services import EmotionService
from ..utils.response import make_response

@emotion_bp.route('/', methods=['POST'])
def detect_emotions():

    data = request.get_json()

    emotions = EmotionService.analyze(data)

    return make_response(
            status_code=200,
            data= emotions,  
            message=f'Emotions detected sucessfully.',
        )

@emotion_bp.route('/health', methods=['GET'])
def health():

    health_info = EmotionService.model_info()

    return make_response(
        status_code=200,
        data=health_info,
        message=f'Model health loaded successfully.'
    )

@emotion_bp.route('/info', methods=['GET'])
def info():

    available_emotion_info = EmotionService.emotion_label_info()

    return make_response(
        status_code=200,
        data=available_emotion_info,
        message=f'Information about available emotions loaded sucessfully.'
    )