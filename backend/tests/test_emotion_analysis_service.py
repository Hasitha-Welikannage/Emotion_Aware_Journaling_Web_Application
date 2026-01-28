import pytest
from unittest.mock import patch, MagicMock

from app.emotion_analysis.services import EmotionAnalysisService
from app.utils.custom_exceptions import BadRequestError

def test_emotion_detection_success():
    fake_response = {
        "success": True,
        "data": [
            {"emotion": "joy", "score": 0.92},
            {"emotion": "sadness", "score": 0.12},
        ]
    }

    mock_post = MagicMock()
    mock_post.json.return_value = fake_response

    with patch("app.emotion_analysis.services.requests.post",
               return_value=mock_post):

        result = EmotionAnalysisService.emotion_detection("I feel great")

        assert result == {
            "joy": 0.92,
            "sadness": 0.12
        }

def test_emotion_detection_bad_request():
    fake_response = {
        "success": False,
        "status_code": 400,
        "message": "Invalid input"
    }

    mock_post = MagicMock()
    mock_post.json.return_value = fake_response

    with patch("app.emotion_analysis.services.requests.post",
               return_value=mock_post):

        with pytest.raises(BadRequestError):
            EmotionAnalysisService.emotion_detection("")

def test_emotion_detection_server_error():
    fake_response = {
        "success": False,
        "status_code": 500,
        "message": "Model crashed"
    }

    mock_post = MagicMock()
    mock_post.json.return_value = fake_response

    with patch("app.emotion_analysis.services.requests.post",
               return_value=mock_post):

        with pytest.raises(Exception):
            EmotionAnalysisService.emotion_detection("text")

def test_emotion_detection_request_failure():
    with patch(
        "app.emotion_analysis.services.requests.post",
        side_effect=Exception("Connection refused")
    ):
        with pytest.raises(Exception):
            EmotionAnalysisService.emotion_detection("text")

def test_emotion_detection_request_payload():
    mock_post = MagicMock()
    mock_post.json.return_value = {"success": True, "data": []}

    with patch("app.emotion_analysis.services.requests.post",
               return_value=mock_post) as post:

        EmotionAnalysisService.emotion_detection("hello")

        post.assert_called_once()
        args, kwargs = post.call_args

        assert kwargs["json"]["text"] == "hello"
        assert kwargs["json"]["threshold"] == 0.01
        assert kwargs["json"]["top_k"] == 28
