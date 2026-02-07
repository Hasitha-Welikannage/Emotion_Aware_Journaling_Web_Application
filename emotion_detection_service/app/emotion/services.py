from .emotion_detection import EmotionDetection
from ..utils.custom_exceptions import BadRequestError

class EmotionService():

    @staticmethod
    def analyze(data):

        if not data:
            raise BadRequestError(message='JSON body is required.')
        
        if not 'text' in data or not data.get('text').strip():
            raise BadRequestError(message='Journal text is required.')
        
        text = data.get('text').strip()
        threshold = data.get('threshold', EmotionDetection.default_threshhold)
        top_k = data.get('top_k')
        strategy = data.get('strategy','average')

        if not isinstance(text, str):
            raise BadRequestError(message=f'Text must be a string, got {type(text)}')
        if not isinstance(threshold, (int, float)) or not 0 <= threshold <= 1:
            raise BadRequestError(message='Threshold must be between 0 and 1')
        if strategy not in ("average", "max"):
            raise BadRequestError(message='Strategy must be "average" or "max"')
        if top_k is not None and (not isinstance(top_k, int) or top_k <= 0):
            raise BadRequestError(message='top_k must be a positive integer')

        emotions = EmotionDetection.predict(text=text, threshold=threshold, top_k=top_k, strategy=strategy)

        return emotions

    @staticmethod
    def model_info():

        return {
            "status": "healthy",
            "model": "DistilBERT-GoEmotions",
            "device": str(EmotionDetection.device),
            "max_length": EmotionDetection.max_length,
            "num_emotions": len(EmotionDetection.emotion_labels),
            "emotions": EmotionDetection.emotion_labels
        }

    @staticmethod
    def emotion_label_info():

        emotion_labels = EmotionDetection.emotion_labels

        return {
            "emotions": emotion_labels,
            "count": len(emotion_labels),
            "default_threshold": 0.3,
            "max_text_length": "unlimited (automatic chunking)",
            "strategies": ["average", "max"]
        }