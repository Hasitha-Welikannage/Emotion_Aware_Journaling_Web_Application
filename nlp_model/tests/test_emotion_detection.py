import pytest
import numpy as np
from unittest.mock import MagicMock, patch

from app.emotion.emotion_detection import EmotionDetection

@pytest.fixture(autouse=True)
def reset_emotion_detection():
    EmotionDetection.tokenizer = None
    EmotionDetection.model = None
    EmotionDetection.device = None
    EmotionDetection.emotion_labels = None

def test_load_model_only_once():
    fake_tokenizer = MagicMock()
    fake_model = MagicMock()
    fake_model.config.id2label = {0: "joy", 1: "sadness"}

    with patch(
        "app.emotion_detection.emotion_detection.DistilBertTokenizerFast.from_pretrained",
        return_value=fake_tokenizer
    ), patch(
        "app.emotion_detection.emotion_detection.DistilBertForSequenceClassification.from_pretrained",
        return_value=fake_model
    ), patch(
        "app.emotion_detection.emotion_detection.torch.device",
        return_value="cpu"
    ), patch(
        "app.emotion_detection.emotion_detection.torch.cuda.is_available",
        return_value=False
    ):

        EmotionDetection.load_model()
        EmotionDetection.load_model()  # second call should do nothing

        assert EmotionDetection.tokenizer == fake_tokenizer
        assert EmotionDetection.model == fake_model
        assert EmotionDetection.emotion_labels == ["joy", "sadness"]

def test_predict_chunk_returns_numpy_array():
    EmotionDetection.tokenizer = MagicMock()
    EmotionDetection.model = MagicMock()
    EmotionDetection.device = "cpu"

    fake_tensor = MagicMock()
    fake_tensor.squeeze.return_value.cpu.return_value.numpy.return_value = np.array([0.1, 0.9])

    EmotionDetection.tokenizer.return_value.to.return_value = {}
    EmotionDetection.model.return_value.logits = fake_tensor

    with patch("app.emotion_detection.emotion_detection.torch.no_grad"):
        result = EmotionDetection._predict_chunk("text")

        assert isinstance(result, np.ndarray)
        assert result.shape == (2,)

def test_predict_with_chunking_average():
    EmotionDetection.tokenizer = MagicMock()
    EmotionDetection.tokenizer.decode.return_value = "chunk"
    EmotionDetection.chunk_overlap = 0
    EmotionDetection.max_length = 5

    with patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._predict_chunk",
        side_effect=[
            np.array([0.2, 0.8]),
            np.array([0.6, 0.4])
        ]
    ):
        tokens = list(range(10))
        result = EmotionDetection._predict_with_chunking(tokens, "average")

        assert np.allclose(result, np.array([0.4, 0.6]))

def test_predict_with_chunking_max():
    EmotionDetection.tokenizer = MagicMock()
    EmotionDetection.tokenizer.decode.return_value = "chunk"
    EmotionDetection.chunk_overlap = 0
    EmotionDetection.max_length = 5

    with patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._predict_chunk",
        side_effect=[
            np.array([0.1, 0.9]),
            np.array([0.8, 0.2])
        ]
    ):
        tokens = list(range(10))
        result = EmotionDetection._predict_with_chunking(tokens, "max")

        assert np.allclose(result, np.array([0.8, 0.9]))

def test_predict_with_chunking_invalid_strategy():
    EmotionDetection.tokenizer = MagicMock()
    tokens = list(range(10))

    with pytest.raises(ValueError):
        EmotionDetection._predict_with_chunking(tokens, "median")

def test_format_results():
    EmotionDetection.emotion_labels = ["joy", "sadness"]

    probs = np.array([0.8, 0.2])

    result = EmotionDetection._format_results(
        probabilities=probs,
        threshold=0.3,
        top_k=None
    )

    assert result[0]["emotion"] == "joy"
    assert result[0]["detected"] is True
    assert result[1]["detected"] is False

def test_format_results_top_k():
    EmotionDetection.emotion_labels = ["joy", "sadness", "anger"]
    probs = np.array([0.9, 0.1, 0.8])

    result = EmotionDetection._format_results(
        probabilities=probs,
        threshold=0.0,
        top_k=2
    )

    assert len(result) == 2

def test_predict_short_text():
    EmotionDetection.max_length = 10
    EmotionDetection.emotion_labels = ["joy"]

    with patch(
        "app.emotion_detection.emotion_detection.EmotionDetection.load_model"
    ), patch(
        "app.emotion_detection.emotion_detection.EmotionDetection.tokenizer"
    ) as tokenizer, patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._predict_chunk",
        return_value=np.array([0.9])
    ), patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._format_results",
        return_value=[{"emotion": "joy"}]
    ):
        tokenizer.encode.return_value = [1, 2]

        result = EmotionDetection.predict("hi")

        assert result[0]["emotion"] == "joy"

def test_predict_long_text():
    EmotionDetection.max_length = 3
    EmotionDetection.emotion_labels = ["joy"]

    with patch(
        "app.emotion_detection.emotion_detection.EmotionDetection.load_model"
    ), patch(
        "app.emotion_detection.emotion_detection.EmotionDetection.tokenizer"
    ) as tokenizer, patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._predict_with_chunking",
        return_value=np.array([0.7])
    ), patch(
        "app.emotion_detection.emotion_detection.EmotionDetection._format_results",
        return_value=[{"emotion": "joy"}]
    ):
        tokenizer.encode.return_value = [1, 2, 3, 4, 5]

        result = EmotionDetection.predict("long text")

        assert result[0]["emotion"] == "joy"
