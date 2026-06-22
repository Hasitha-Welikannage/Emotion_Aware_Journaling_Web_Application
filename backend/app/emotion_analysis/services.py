import os
import requests
from requests.exceptions import ConnectionError, Timeout, RequestException
from ..utils.custom_exceptions import BadRequestError, ServiceUnavailableError

ML_SERVICE_URL = os.environ.get("ML_SERVICE_URL", "http://localhost:5001")

class EmotionAnalysisService:


    @staticmethod
    def emotion_detection(text: str) -> dict:

        try:
            response = requests.post(f'{ML_SERVICE_URL}/api/v1/emotion_detect/',
                json= {
                    "text": text,
                    "threshold": 0.01,  # Optional, default 0.3
                    "top_k": 28,  # Optional, return top 10 emotions
                    "strategy": "average"  # Optional: "average" or "max"
                }, timeout=10              
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
                    raise ServiceUnavailableError(message="Emotion Analysis Service returned an error.")
        except (ConnectionError, Timeout):
            raise ServiceUnavailableError(message="Emotion Analysis Service is unavailable.")        
        except RequestException as e:
            raise ServiceUnavailableError(message=str(e))
        except Exception:
            raise        