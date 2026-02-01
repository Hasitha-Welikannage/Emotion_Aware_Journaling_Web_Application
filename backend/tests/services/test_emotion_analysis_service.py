import pytest
from unittest.mock import Mock, patch
import requests

from app.emotion_analysis.services import EmotionAnalysisService
from app.utils.custom_exceptions import BadRequestError, ServiceUnavailableError


class TestEmotionAnalysisService:
    """Test suite for EmotionAnalysisService class"""

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_success(self, mock_post):
        """Test successful emotion detection with valid text"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy", "score": 0.85},
                {"emotion": "excitement", "score": 0.72},
                {"emotion": "happiness", "score": 0.65}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("I am so happy today!")

        assert isinstance(result, dict)
        assert len(result) == 3
        assert result["joy"] == 0.85
        assert result["excitement"] == 0.72
        assert result["happiness"] == 0.65

        # Verify API was called with correct parameters
        mock_post.assert_called_once_with(
            'http://127.0.0.1:5001/api/v1/emotion_detect/',
            json={
                "text": "I am so happy today!",
                "threshold": 0.01,
                "top_k": 28,
                "strategy": "average"
            },
            timeout=10
        )

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_single_emotion(self, mock_post):
        """Test emotion detection returning single emotion"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "sadness", "score": 0.92}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("I feel sad")

        assert len(result) == 1
        assert result["sadness"] == 0.92

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_empty_result(self, mock_post):
        """Test emotion detection with no emotions detected"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": []
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Hello")

        assert isinstance(result, dict)
        assert len(result) == 0

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_multiple_emotions(self, mock_post):
        """Test emotion detection with many emotions"""
        mock_response = Mock()
        emotions_data = [
            {"emotion": f"emotion_{i}", "score": 0.5 + (i * 0.01)}
            for i in range(10)
        ]
        mock_response.json.return_value = {
            "success": True,
            "data": emotions_data
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Complex emotional text")

        assert len(result) == 10
        assert all(emotion in result for emotion in [f"emotion_{i}" for i in range(10)])

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_low_confidence_scores(self, mock_post):
        """Test emotion detection with low confidence scores"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy", "score": 0.02},
                {"emotion": "sadness", "score": 0.01}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Neutral text")

        assert result["joy"] == 0.02
        assert result["sadness"] == 0.01

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_high_confidence_scores(self, mock_post):
        """Test emotion detection with high confidence scores"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy", "score": 0.99},
                {"emotion": "excitement", "score": 0.95}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Very emotional text!")

        assert result["joy"] == 0.99
        assert result["excitement"] == 0.95

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_long_text(self, mock_post):
        """Test emotion detection with long text input"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "contemplation", "score": 0.75}
            ]
        }
        mock_post.return_value = mock_response

        long_text = "This is a very long text. " * 100
        result = EmotionAnalysisService.emotion_detection(long_text)

        assert result["contemplation"] == 0.75
        mock_post.assert_called_once()
        # Verify the long text was sent
        call_args = mock_post.call_args
        assert call_args[1]['json']['text'] == long_text

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_special_characters(self, mock_post):
        """Test emotion detection with special characters in text"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "confusion", "score": 0.60}
            ]
        }
        mock_post.return_value = mock_response

        special_text = "What?! @#$% & *()..."
        result = EmotionAnalysisService.emotion_detection(special_text)

        assert result["confusion"] == 0.60

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_api_failure_not_successful(self, mock_post):
        """Test when API returns success=False without status_code"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": False,
            "message": "Something went wrong"
        }
        mock_post.return_value = mock_response

        # The service doesn't handle this case properly, it returns None
        result = EmotionAnalysisService.emotion_detection("Test text")

        assert result is None

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_api_400_error(self, mock_post):
        """Test when API returns 400 Bad Request"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": False,
            "status_code": 400,
            "message": "Invalid input text"
        }
        mock_post.return_value = mock_response

        with pytest.raises(BadRequestError) as exc_info:
            EmotionAnalysisService.emotion_detection("Invalid text")

        assert exc_info.value.message == "Invalid input text"

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_api_500_error(self, mock_post):
        """Test when API returns 500 Internal Server Error"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": False,
            "status_code": 500,
            "message": "Internal server error"
        }
        mock_post.return_value = mock_response

        with pytest.raises(Exception):
            EmotionAnalysisService.emotion_detection("Test text")

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_connection_error(self, mock_post):
        """Test when connection to API fails"""
        mock_post.side_effect = requests.ConnectionError("Connection refused")

        with pytest.raises(ServiceUnavailableError) as exc_info:
            EmotionAnalysisService.emotion_detection("Test text")

        assert exc_info.value.message == "Emotion Analysis Service is unavailable."

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_timeout_error(self, mock_post):
        """Test when API request times out"""
        mock_post.side_effect = requests.Timeout("Request timeout")

        with pytest.raises(ServiceUnavailableError) as exc_info:
            EmotionAnalysisService.emotion_detection("Test text")

        assert exc_info.value.message == "Emotion Analysis Service is unavailable."

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_json_decode_error(self, mock_post):
        """Test when API returns invalid JSON"""
        mock_response = Mock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_post.return_value = mock_response

        with pytest.raises(ValueError):
            EmotionAnalysisService.emotion_detection("Test text")

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_unexpected_response_format(self, mock_post):
        """Test when API returns unexpected response format"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"wrong_key": "value"}  # Missing emotion and score keys
            ]
        }
        mock_post.return_value = mock_response

        # Since .get() returns None for missing keys, result will be {None: None}
        result = EmotionAnalysisService.emotion_detection("Test text")

        assert result == {None: None}

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_missing_data_field(self, mock_post):
        """Test when API response is missing 'data' field"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True
            # Missing 'data' field
        }
        mock_post.return_value = mock_response

        with pytest.raises(TypeError):
            EmotionAnalysisService.emotion_detection("Test text")

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_empty_text(self, mock_post):
        """Test emotion detection with empty string"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": []
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("")

        assert result == {}
        # Verify empty string was sent
        call_args = mock_post.call_args
        assert call_args[1]['json']['text'] == ""

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_whitespace_text(self, mock_post):
        """Test emotion detection with whitespace-only text"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": []
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("   ")

        assert result == {}

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_unicode_text(self, mock_post):
        """Test emotion detection with unicode characters"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy", "score": 0.80}
            ]
        }
        mock_post.return_value = mock_response

        unicode_text = "¡Hola! 你好 🎉"
        result = EmotionAnalysisService.emotion_detection(unicode_text)

        assert result["joy"] == 0.80
        # Verify unicode text was sent correctly
        call_args = mock_post.call_args
        assert call_args[1]['json']['text'] == unicode_text

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_newlines_in_text(self, mock_post):
        """Test emotion detection with text containing newlines"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "mixed", "score": 0.70}
            ]
        }
        mock_post.return_value = mock_response

        multiline_text = "Line 1\nLine 2\nLine 3"
        result = EmotionAnalysisService.emotion_detection(multiline_text)

        assert result["mixed"] == 0.70

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_api_parameters(self, mock_post):
        """Test that correct parameters are sent to API"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": []
        }
        mock_post.return_value = mock_response

        EmotionAnalysisService.emotion_detection("Test")

        # Verify all parameters are sent correctly
        call_args = mock_post.call_args
        json_data = call_args[1]['json']
        assert json_data['threshold'] == 0.01
        assert json_data['top_k'] == 28
        assert json_data['strategy'] == "average"
        assert json_data['text'] == "Test"

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_api_url(self, mock_post):
        """Test that correct API URL is used"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": []
        }
        mock_post.return_value = mock_response

        EmotionAnalysisService.emotion_detection("Test")

        # Verify correct URL is used
        call_args = mock_post.call_args
        assert call_args[0][0] == 'http://127.0.0.1:5001/api/v1/emotion_detect/'

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_float_scores(self, mock_post):
        """Test that emotion scores are properly handled as floats"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy", "score": 0.123456789},
                {"emotion": "sadness", "score": 0.987654321}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Test")

        assert isinstance(result["joy"], float)
        assert isinstance(result["sadness"], float)
        assert result["joy"] == 0.123456789
        assert result["sadness"] == 0.987654321

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_zero_scores(self, mock_post):
        """Test emotion detection with zero confidence scores"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "neutral", "score": 0.0}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Neutral")

        assert result["neutral"] == 0.0

    @patch('app.emotion_analysis.services.requests.post')
    def test_emotion_detection_emotion_name_variations(self, mock_post):
        """Test various emotion name formats"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": [
                {"emotion": "joy-happiness", "score": 0.8},
                {"emotion": "fear_anxiety", "score": 0.6},
                {"emotion": "Sadness", "score": 0.5},
                {"emotion": "ANGER", "score": 0.4}
            ]
        }
        mock_post.return_value = mock_response

        result = EmotionAnalysisService.emotion_detection("Mixed emotions")

        assert "joy-happiness" in result
        assert "fear_anxiety" in result
        assert "Sadness" in result
        assert "ANGER" in result
