import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime, timezone

from app.journals.services import JournalService
from app.utils.custom_exceptions import (
    BadRequestError,
    NotFoundError
)


@pytest.fixture
def mock_journal_entry():
    """Fixture for creating a mock journal entry"""
    entry = Mock()
    entry.id = 1
    entry.user_id = 1
    entry.title = "Test Entry"
    entry.content = "This is a test journal entry"
    entry.created_at = datetime.now(timezone.utc)
    entry.emotions = []
    entry.to_dict = Mock(return_value={
        "id": 1,
        "title": "Test Entry",
        "content": "This is a test journal entry",
        "created_at": entry.created_at.isoformat(),
        "emotions": []
    })
    return entry


@pytest.fixture
def mock_emotion():
    """Fixture for creating a mock emotion"""
    emotion = Mock()
    emotion.emotion_name = "joy"
    emotion.confidence_score = 0.85
    emotion.to_dict = Mock(return_value={
        "name": "joy",
        "confidence": 0.85
    })
    return emotion


class TestJournalService:
    """Test suite for JournalService class"""

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_get_journal_entries_success(self, mock_current_user, mock_journal_class, mock_journal_entry):
        """Test getting all journal entries for a user"""
        mock_current_user.id = 1
        mock_journal_entry2 = Mock()
        mock_journal_entry2.to_dict.return_value = {
            "id": 2,
            "title": "Another Entry",
            "content": "Another test",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "emotions": []
        }
        mock_journal_class.query.filter_by.return_value.all.return_value = [
            mock_journal_entry,
            mock_journal_entry2
        ]

        result = JournalService.get_journal_entries()

        assert len(result) == 2
        assert result[0]["id"] == 1
        assert result[1]["id"] == 2
        mock_journal_class.query.filter_by.assert_called_once_with(user_id=1)

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_get_journal_entries_empty(self, mock_current_user, mock_journal_class):
        """Test getting journal entries when user has none"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.all.return_value = []

        result = JournalService.get_journal_entries()

        assert result == []
        mock_journal_class.query.filter_by.assert_called_once_with(user_id=1)

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_get_journal_entry_by_id_success(self, mock_current_user, mock_journal_class, mock_journal_entry):
        """Test getting a specific journal entry by ID"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        result = JournalService.get_journal_entry_by_id(1)

        assert result["id"] == 1
        assert result["title"] == "Test Entry"
        mock_journal_class.query.filter_by.assert_called_once_with(id=1, user_id=1)

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_get_journal_entry_by_id_not_found(self, mock_current_user, mock_journal_class):
        """Test getting a journal entry that doesn't exist"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError) as exc_info:
            JournalService.get_journal_entry_by_id(999)

        assert exc_info.value.message == "Journal entry not found."

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.Emotion')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_success(
        self, mock_current_user, mock_journal_class, mock_emotion_class,
        mock_emotion_service, mock_db_session
    ):
        """Test creating a new journal entry with emotion analysis"""
        mock_current_user.id = 1
        mock_entry_instance = Mock()
        mock_entry_instance.id = 1
        mock_entry_instance.emotions = []
        mock_entry_instance.to_dict.return_value = {
            "id": 1,
            "title": "My Day",
            "content": "Today was great!",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "emotions": [{"name": "joy", "confidence": 0.9}]
        }
        mock_journal_class.return_value = mock_entry_instance
        mock_emotion_service.emotion_detection.return_value = {"joy": 0.9, "excitement": 0.7}

        data = {
            "title": "My Day",
            "content": "Today was great!"
        }

        result = JournalService.create_journal_entry(data)

        assert result["title"] == "My Day"
        mock_journal_class.assert_called_once_with(
            user_id=1,
            title="My Day",
            content="Today was great!"
        )
        mock_emotion_service.emotion_detection.assert_called_once_with("Today was great!")
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_empty_json(self, mock_current_user):
        """Test creating entry with empty JSON body"""
        with pytest.raises(BadRequestError) as exc_info:
            JournalService.create_journal_entry(None)

        assert exc_info.value.message == "JSON body is required."

    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_missing_title(self, mock_current_user):
        """Test creating entry without title"""
        data = {"content": "Some content"}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.create_journal_entry(data)

        assert exc_info.value.message == "Title is required."

    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_empty_title(self, mock_current_user):
        """Test creating entry with empty title"""
        data = {"title": "", "content": "Some content"}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.create_journal_entry(data)

        assert exc_info.value.message == "Title is required."

    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_missing_content(self, mock_current_user):
        """Test creating entry without content"""
        data = {"title": "My Title"}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.create_journal_entry(data)

        assert exc_info.value.message == "content is required."

    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_empty_content(self, mock_current_user):
        """Test creating entry with empty content"""
        data = {"title": "My Title", "content": ""}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.create_journal_entry(data)

        assert exc_info.value.message == "content is required."

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_database_error(
        self, mock_current_user, mock_journal_class, mock_emotion_service, mock_db_session
    ):
        """Test creating entry when database commit fails"""
        mock_current_user.id = 1
        mock_entry_instance = Mock()
        mock_entry_instance.id = 1
        mock_entry_instance.emotions = []
        mock_journal_class.return_value = mock_entry_instance
        mock_emotion_service.emotion_detection.return_value = {"joy": 0.9}
        mock_db_session.commit.side_effect = Exception("Database error")

        data = {"title": "My Day", "content": "Today was great!"}

        with pytest.raises(Exception) as exc_info:
            JournalService.create_journal_entry(data)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_title_only(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test updating only the title of a journal entry"""
        mock_current_user.id = 1
        mock_journal_entry.title = "Old Title"
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"title": "New Title"}
        result = JournalService.update_journal_entry(1, data)

        assert mock_journal_entry.title == "New Title"
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.Emotion')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_content_only(
        self, mock_current_user, mock_journal_class, mock_emotion_class,
        mock_emotion_service, mock_db_session, mock_journal_entry
    ):
        """Test updating only the content (triggers emotion re-analysis)"""
        mock_current_user.id = 1
        mock_journal_entry.content = "Old content"
        mock_journal_entry.emotions = Mock()
        mock_journal_entry.emotions.clear = Mock()
        mock_journal_entry.emotions.append = Mock()
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry
        mock_emotion_service.emotion_detection.return_value = {"sadness": 0.8}

        data = {"content": "New content"}
        result = JournalService.update_journal_entry(1, data)

        assert mock_journal_entry.content == "New content"
        mock_journal_entry.emotions.clear.assert_called_once()
        mock_emotion_service.emotion_detection.assert_called_once_with("New content")
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_both_fields(
        self, mock_current_user, mock_journal_class,
        mock_emotion_service, mock_db_session, mock_journal_entry
    ):
        """Test updating both title and content"""
        mock_current_user.id = 1
        mock_journal_entry.title = "Old Title"
        mock_journal_entry.content = "Old content"
        mock_journal_entry.emotions = Mock()
        mock_journal_entry.emotions.clear = Mock()
        mock_journal_entry.emotions.append = Mock()
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry
        mock_emotion_service.emotion_detection.return_value = {"joy": 0.9}

        data = {"title": "New Title", "content": "New content"}
        result = JournalService.update_journal_entry(1, data)

        assert mock_journal_entry.title == "New Title"
        assert mock_journal_entry.content == "New content"
        mock_emotion_service.emotion_detection.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_not_found(self, mock_current_user, mock_journal_class):
        """Test updating a journal entry that doesn't exist"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = None

        data = {"title": "New Title"}

        with pytest.raises(NotFoundError) as exc_info:
            JournalService.update_journal_entry(999, data)

        assert exc_info.value.message == "Journal entry not found."

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_empty_json(self, mock_current_user, mock_journal_class, mock_journal_entry):
        """Test updating with empty JSON body"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.update_journal_entry(1, None)

        assert exc_info.value.message == "JSON body is required."

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_empty_title(self, mock_current_user, mock_journal_class, mock_journal_entry):
        """Test updating with empty title"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"title": ""}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.update_journal_entry(1, data)

        assert exc_info.value.message == "Title is required."

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_empty_content(self, mock_current_user, mock_journal_class, mock_journal_entry):
        """Test updating with empty content"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"content": ""}

        with pytest.raises(BadRequestError) as exc_info:
            JournalService.update_journal_entry(1, data)

        assert exc_info.value.message == "content is required."

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_same_title_no_change(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test updating with same title doesn't trigger change"""
        mock_current_user.id = 1
        mock_journal_entry.title = "Same Title"
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"title": "Same Title"}
        result = JournalService.update_journal_entry(1, data)

        # Title should still be the same but commit should be called
        assert mock_journal_entry.title == "Same Title"
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_same_content_no_reanalysis(
        self, mock_current_user, mock_journal_class, mock_emotion_service, mock_db_session, mock_journal_entry
    ):
        """Test updating with same content doesn't trigger emotion re-analysis"""
        mock_current_user.id = 1
        mock_journal_entry.content = "Same content"
        mock_journal_entry.emotions = Mock()
        mock_journal_entry.emotions.clear = Mock()
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"content": "Same content"}
        result = JournalService.update_journal_entry(1, data)

        # Emotions should not be cleared or re-analyzed
        mock_journal_entry.emotions.clear.assert_not_called()
        mock_emotion_service.emotion_detection.assert_not_called()
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_database_error(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test updating entry when database commit fails"""
        mock_current_user.id = 1
        mock_journal_entry.title = "Old Title"
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry
        mock_db_session.commit.side_effect = Exception("Database error")

        data = {"title": "New Title"}

        with pytest.raises(Exception) as exc_info:
            JournalService.update_journal_entry(1, data)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_delete_journal_entry_success(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test deleting a journal entry"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        JournalService.delete_journal_entry(1)

        mock_journal_class.query.filter_by.assert_called_once_with(id=1, user_id=1)
        mock_db_session.delete.assert_called_once_with(mock_journal_entry)
        mock_db_session.commit.assert_called_once()

    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_delete_journal_entry_not_found(self, mock_current_user, mock_journal_class):
        """Test deleting a journal entry that doesn't exist"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError) as exc_info:
            JournalService.delete_journal_entry(999)

        assert exc_info.value.message == "Journal entry not found."

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_delete_journal_entry_database_error(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test deleting entry when database commit fails"""
        mock_current_user.id = 1
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry
        mock_db_session.commit.side_effect = Exception("Database error")

        with pytest.raises(Exception) as exc_info:
            JournalService.delete_journal_entry(1)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.EmotionAnalysisService')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_create_journal_entry_strips_whitespace(
        self, mock_current_user, mock_journal_class, mock_emotion_service, mock_db_session
    ):
        """Test that create strips whitespace from title and content"""
        mock_current_user.id = 1
        mock_entry_instance = Mock()
        mock_entry_instance.id = 1
        mock_entry_instance.emotions = []
        mock_entry_instance.to_dict.return_value = {"id": 1}
        mock_journal_class.return_value = mock_entry_instance
        mock_emotion_service.emotion_detection.return_value = {}

        data = {
            "title": "  My Day  ",
            "content": "  Today was great!  "
        }

        JournalService.create_journal_entry(data)

        # Verify stripped values were passed
        mock_journal_class.assert_called_once_with(
            user_id=1,
            title="My Day",
            content="Today was great!"
        )
        mock_emotion_service.emotion_detection.assert_called_once_with("Today was great!")

    @patch('app.journals.services.db.session')
    @patch('app.journals.services.JournalEntry')
    @patch('app.journals.services.current_user', new_callable=MagicMock)
    def test_update_journal_entry_strips_whitespace(
        self, mock_current_user, mock_journal_class, mock_db_session, mock_journal_entry
    ):
        """Test that update strips whitespace from title"""
        mock_current_user.id = 1
        mock_journal_entry.title = "Old Title"
        mock_journal_class.query.filter_by.return_value.first.return_value = mock_journal_entry

        data = {"title": "  New Title  "}
        JournalService.update_journal_entry(1, data)

        assert mock_journal_entry.title == "New Title"
