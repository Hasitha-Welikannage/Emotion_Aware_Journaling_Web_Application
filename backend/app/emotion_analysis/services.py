import requests
from ..utils.custom_exceptions import BadRequestError

class EmotionAnalysisService:

    @staticmethod
    def emotion_detection(text: str) -> dict:

        try:
            response = requests.post('http://127.0.0.1:5001/api/v1/emotion_detect/',
                json= {
                    "text": text,
                    "threshold": 0.01,  # Optional, default 0.3
                    "top_k": 28,  # Optional, return top 10 emotions
                    "strategy": "average"  # Optional: "average" or "max"
                }              
            )

            response = response.json()

            if response.get('success'):
                emotions = response.get('data')
                emotions = {
                    emotion.get('emotion'): emotion.get('score') for emotion in emotions
                }
                return emotions
            else:
                if response.get('status_code') == 400:
                    raise BadRequestError(message=response.get('message'))
                if response.get('status_code') == 500:
                    raise
        except Exception:
            raise        