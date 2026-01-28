import pytest
from unittest.mock import MagicMock, patch

from app.journals.services import JournalService
from app.utils.custom_exceptions import NotFoundError, BadRequestError

@pytest.fixture
def mock_journal_entry():
    entry = MagicMock()
    entry.id = 10
    entry.user_id = 1
    entry.title = "Old title"
    entry.content = "Old content"
    entry.emotions = []
    entry.to_dict.return_value = {
        "id": 10,
        "title": "Old title",
        "content": "Old content"
    }
    return entry

def test_get_journal_entries(mock_user, mock_journal_entry):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query:

        query.filter_by.return_value.all.return_value = [mock_journal_entry]

        result = JournalService.get_journal_entries()

        assert len(result) == 1
        assert result[0]["id"] == 10

def test_get_journal_entry_by_id_success(mock_user, mock_journal_entry):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query:

        query.filter_by.return_value.first.return_value = mock_journal_entry

        result = JournalService.get_journal_entry_by_id(10)
        assert result["id"] == 10

def test_get_journal_entry_by_id_not_found(mock_user):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query:

        query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError):
            JournalService.get_journal_entry_by_id(999)

def test_create_journal_entry_success(mock_user):
    data = {
        "title": " My day ",
        "content": " I feel great "
    }

    fake_emotions = {"joy": 0.9, "confidence": 0.7}

    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.EmotionAnalysisService.emotion_detection",
               return_value=fake_emotions), \
         patch("app.services.journal_service.db.session.add") as add, \
         patch("app.services.journal_service.db.session.commit"):

        result = JournalService.create_journal_entry(data)

        add.assert_called_once()
        assert result["title"] == "Old title" or "title" in result

def test_create_journal_entry_no_body(mock_user):
    with patch("app.services.journal_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            JournalService.create_journal_entry(None)

def test_create_journal_entry_missing_title(mock_user):
    with patch("app.services.journal_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            JournalService.create_journal_entry({"content": "text"})

def test_create_journal_entry_missing_content(mock_user):
    with patch("app.services.journal_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            JournalService.create_journal_entry({"title": "title"})

def test_create_journal_entry_db_error(mock_user):
    data = {"title": "t", "content": "c"}

    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.EmotionAnalysisService.emotion_detection",
               return_value={}), \
         patch("app.services.journal_service.db.session.commit", side_effect=Exception), \
         patch("app.services.journal_service.db.session.rollback") as rollback:

        with pytest.raises(Exception):
            JournalService.create_journal_entry(data)

        rollback.assert_called_once()

def test_update_journal_entry_title(mock_user, mock_journal_entry):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query, \
         patch("app.services.journal_service.db.session.commit"):

        query.filter_by.return_value.first.return_value = mock_journal_entry

        result = JournalService.update_journal_entry(
            10, {"title": "New title"}
        )

        assert mock_journal_entry.title == "New title"

def test_update_journal_entry_content_reanalyzes_emotions(
    mock_user, mock_journal_entry
):
    fake_emotions = {"sadness": 0.8}

    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query, \
         patch("app.services.journal_service.EmotionAnalysisService.emotion_detection",
               return_value=fake_emotions) as emotion_mock, \
         patch("app.services.journal_service.db.session.commit"):

        query.filter_by.return_value.first.return_value = mock_journal_entry

        JournalService.update_journal_entry(
            10, {"content": "New content"}
        )

        emotion_mock.assert_called_once_with("New content")

def test_update_journal_entry_not_found(mock_user):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query:

        query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError):
            JournalService.update_journal_entry(99, {"title": "x"})

def test_delete_journal_entry_success(mock_user, mock_journal_entry):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query, \
         patch("app.services.journal_service.db.session.delete") as delete, \
         patch("app.services.journal_service.db.session.commit"):

        query.filter_by.return_value.first.return_value = mock_journal_entry

        JournalService.delete_journal_entry(10)

        delete.assert_called_once_with(mock_journal_entry)

def test_delete_journal_entry_not_found(mock_user):
    with patch("app.services.journal_service.current_user", mock_user), \
         patch("app.services.journal_service.JournalEntry.query") as query:

        query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError):
            JournalService.delete_journal_entry(10)
