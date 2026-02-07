import pytest
from unittest.mock import patch

from app.emotion.services import EmotionService
from app.utils.custom_exceptions import BadRequestError

def test_analyze_success_minimal():
    fake_result = {"joy": 0.91}

    with patch(
        "app.services.emotion_service.EmotionDetection.predict",
        return_value=fake_result
    ), patch(
        "app.services.emotion_service.EmotionDetection.default_threshhold",
        0.3
    ):

        result = EmotionService.analyze({"text": "I feel good"})

        assert result == fake_result

def test_analyze_success_all_params():
    fake_result = {"sadness": 0.7}

    with patch(
        "app.services.emotion_service.EmotionDetection.predict",
        return_value=fake_result
    ) as predict:

        data = {
            "text": "I feel bad",
            "threshold": 0.2,
            "top_k": 5,
            "strategy": "max"
        }

        result = EmotionService.analyze(data)

        predict.assert_called_once_with(
            text="I feel bad",
            threshold=0.2,
            top_k=5,
            strategy="max"
        )
        assert result == fake_result

def test_analyze_no_body():
    with pytest.raises(BadRequestError):
        EmotionService.analyze(None)

def test_analyze_missing_text():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({})

def test_analyze_empty_text():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({"text": "   "})

def test_analyze_text_not_string():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({"text": 123})

def test_analyze_invalid_threshold_type():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({
            "text": "hello",
            "threshold": "high"
        })

def test_analyze_threshold_out_of_range():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({
            "text": "hello",
            "threshold": 2
        })

def test_analyze_invalid_strategy():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({
            "text": "hello",
            "strategy": "median"
        })

def test_analyze_invalid_top_k():
    with pytest.raises(BadRequestError):
        EmotionService.analyze({
            "text": "hello",
            "top_k": -3
        })

def test_model_info():
    with patch("app.services.emotion_service.EmotionDetection.device", "cpu"), \
         patch("app.services.emotion_service.EmotionDetection.max_length", 512), \
         patch("app.services.emotion_service.EmotionDetection.emotion_labels",
               ["joy", "sadness"]):

        result = EmotionService.model_info()

        assert result["status"] == "healthy"
        assert result["device"] == "cpu"
        assert result["num_emotions"] == 2
        assert "joy" in result["emotions"]

def test_emotion_label_info():
    labels = ["joy", "anger", "fear"]

    with patch(
        "app.services.emotion_service.EmotionDetection.emotion_labels",
        labels
    ):
        result = EmotionService.emotion_label_info()

        assert result["count"] == 3
        assert result["emotions"] == labels
        assert "average" in result["strategies"]
