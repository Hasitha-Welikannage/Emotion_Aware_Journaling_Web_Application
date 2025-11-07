from flask import request
from . import emotion_bp
from ..utils.response import make_error, make_response
from .emotion_model import analyze_emotions

@emotion_bp.route('/emotions', methods=['POST'])
def detect_emotions():

    request_path = request.url
    data = request.get_json()
    texts = data.get("texts", None)

    if not texts:
        return make_error(
            message=f'Can not find any users',
            status_code= 404,
            path= request_path
        ) 

    if isinstance(texts, str):
        texts = [texts]

    results = analyze_emotions(texts)

    # Return top 5 emotions per text for readability
    top_results = {k: v for k, v in results.items() if v > 5}

    return make_response(
            status_code=200,
            data= top_results,  
            message=f'Emotions detected sucessfully',
            path=request_path
        )