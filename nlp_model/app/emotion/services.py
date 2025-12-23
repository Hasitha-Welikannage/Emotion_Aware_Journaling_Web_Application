from .emotion_detection import EmotionDetection
from ..utils.custom_exceptions import BadRequestError

class EmotionService():

    @staticmethod
    def analyze(data):

        if not data:
            raise BadRequestError(message='JSON body is required.')
        
        if not 'text' in data or not data.get('text'):
            raise BadRequestError(message='Journal text is required.')
        
        text = data.get('data')
        threshold = data.get('threshold', EmotionDetection.default_threshhold)
        top_k = data.get('top_k')
        strategy = data.get('strategy','average')

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