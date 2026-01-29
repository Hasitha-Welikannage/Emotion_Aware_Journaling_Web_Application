import pytest
from unittest.mock import patch
from flask import json

from app.utils.custom_exceptions import BadRequestError, NotFoundError


class TestJournalsRoutes:
    """Test suite for Journals routes"""

    @pytest.fixture
    def client(self, app):
        """Create a test client for the Flask app"""
        return app.test_client()

    @pytest.fixture
    def app(self):
        """Create and configure a test Flask app"""
        from app import create_app
        app = create_app()
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['LOGIN_DISABLED'] = True  # Disable Flask-Login for testing
        return app

    # ==================== GET /journals/ Tests ====================

    @patch('app.journals.routes.JournalService.get_journal_entries')
    def test_get_journal_entries_success(self, mock_get_entries, client):
        """Test successfully retrieving all journal entries"""
        mock_entries = [
            {
                'id': 1,
                'title': 'First Entry',
                'content': 'This is my first journal entry',
                'created_at': '2024-01-01T12:00:00'
            },
            {
                'id': 2,
                'title': 'Second Entry',
                'content': 'This is my second journal entry',
                'created_at': '2024-01-02T12:00:00'
            }
        ]
        mock_get_entries.return_value = mock_entries

        response = client.get('/journals/')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'Journal entries found successfully'
        assert data['data'] == mock_entries
        assert len(data['data']) == 2
        mock_get_entries.assert_called_once()

    @patch('app.journals.routes.JournalService.get_journal_entries')
    def test_get_journal_entries_empty(self, mock_get_entries, client):
        """Test retrieving journal entries when user has no entries"""
        mock_get_entries.return_value = []

        response = client.get('/journals/')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data'] == []
        assert len(data['data']) == 0
        mock_get_entries.assert_called_once()

    @patch('app.journals.routes.JournalService.get_journal_entries')
    def test_get_journal_entries_service_error(self, mock_get_entries, client):
        """Test when service raises an error"""
        mock_get_entries.side_effect = Exception("Database error")

        response = client.get('/journals/')

        assert response.status_code == 500

    # ==================== GET /journals/<entry_id> Tests ====================

    @patch('app.journals.routes.JournalService.get_journal_entry_by_id')
    def test_get_journal_entry_by_id_success(self, mock_get_entry, client):
        """Test successfully retrieving a specific journal entry"""
        mock_entry = {
            'id': 1,
            'title': 'Test Entry',
            'content': 'This is a test entry',
            'created_at': '2024-01-01T12:00:00',
            'emotions': [
                {'emotion': 'joy', 'score': 0.8}
            ]
        }
        mock_get_entry.return_value = mock_entry

        response = client.get('/journals/1')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'Journal entry found successfully'
        assert data['data'] == mock_entry
        mock_get_entry.assert_called_once_with(1)

    @patch('app.journals.routes.JournalService.get_journal_entry_by_id')
    def test_get_journal_entry_by_id_not_found(self, mock_get_entry, client):
        """Test retrieving non-existent journal entry"""
        mock_get_entry.side_effect = NotFoundError("Journal entry not found.")

        response = client.get('/journals/999')

        assert response.status_code == 404

    def test_get_journal_entry_by_id_invalid_id(self, client):
        """Test retrieving journal entry with invalid ID format"""
        response = client.get('/journals/invalid')

        # Flask routing raises NotFound which is caught by generic Exception handler returning 500
        assert response.status_code == 500

    @patch('app.journals.routes.JournalService.get_journal_entry_by_id')
    def test_get_journal_entry_by_id_service_error(self, mock_get_entry, client):
        """Test when service raises an error"""
        mock_get_entry.side_effect = Exception("Database error")

        response = client.get('/journals/1')

        assert response.status_code == 500

    # ==================== POST /journals/ Tests ====================

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_success(self, mock_create_entry, client):
        """Test successfully creating a journal entry"""
        mock_entry = {
            'id': 1,
            'title': 'New Entry',
            'content': 'This is a new journal entry',
            'created_at': '2024-01-01T12:00:00'
        }
        mock_create_entry.return_value = mock_entry

        entry_data = {
            'title': 'New Entry',
            'content': 'This is a new journal entry'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        assert data['message'] == 'Journal entry created successfully.'
        assert data['data'] == mock_entry
        mock_create_entry.assert_called_once_with(entry_data)

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_missing_title(self, mock_create_entry, client):
        """Test creating journal entry without title"""
        mock_create_entry.side_effect = BadRequestError("Title is required.")

        entry_data = {
            'content': 'This is content without title'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_missing_content(self, mock_create_entry, client):
        """Test creating journal entry without content"""
        mock_create_entry.side_effect = BadRequestError("Content is required.")

        entry_data = {
            'title': 'Title without content'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_empty_json(self, mock_create_entry, client):
        """Test creating journal entry with empty JSON body"""
        mock_create_entry.side_effect = BadRequestError("Title is required.")

        response = client.post(
            '/journals/',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_create_journal_entry_no_json(self, client):
        """Test creating journal entry without JSON content type"""
        response = client.post('/journals/')

        assert response.status_code >= 400

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_whitespace_title(self, mock_create_entry, client):
        """Test creating journal entry with whitespace-only title"""
        mock_create_entry.side_effect = BadRequestError("Title is required.")

        entry_data = {
            'title': '   ',
            'content': 'Valid content'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_whitespace_content(self, mock_create_entry, client):
        """Test creating journal entry with whitespace-only content"""
        mock_create_entry.side_effect = BadRequestError("Content is required.")

        entry_data = {
            'title': 'Valid title',
            'content': '   '
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_with_emotions(self, mock_create_entry, client):
        """Test creating journal entry triggers emotion analysis"""
        mock_entry = {
            'id': 1,
            'title': 'Happy Day',
            'content': 'Today was a wonderful day!',
            'emotions': [
                {'emotion': 'joy', 'score': 0.9}
            ]
        }
        mock_create_entry.return_value = mock_entry

        entry_data = {
            'title': 'Happy Day',
            'content': 'Today was a wonderful day!'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        assert 'emotions' in data['data']
        mock_create_entry.assert_called_once_with(entry_data)

    @patch('app.journals.routes.JournalService.create_journal_entry')
    def test_create_journal_entry_service_error(self, mock_create_entry, client):
        """Test when service raises an error during creation"""
        mock_create_entry.side_effect = Exception("Database error")

        entry_data = {
            'title': 'Test Entry',
            'content': 'Test content'
        }

        response = client.post(
            '/journals/',
            data=json.dumps(entry_data),
            content_type='application/json'
        )

        assert response.status_code == 500

    # ==================== PUT /journals/<entry_id> Tests ====================

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_success(self, mock_update_entry, client):
        """Test successfully updating a journal entry"""
        mock_entry = {
            'id': 1,
            'title': 'Updated Title',
            'content': 'Updated content',
            'updated_at': '2024-01-02T12:00:00'
        }
        mock_update_entry.return_value = mock_entry

        update_data = {
            'title': 'Updated Title',
            'content': 'Updated content'
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'Journal entry updated successfully.'
        assert data['data'] == mock_entry
        mock_update_entry.assert_called_once_with(1, update_data)

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_not_found(self, mock_update_entry, client):
        """Test updating non-existent journal entry"""
        mock_update_entry.side_effect = NotFoundError("Journal entry not found.")

        update_data = {
            'title': 'Updated Title',
            'content': 'Updated content'
        }

        response = client.put(
            '/journals/999',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 404

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_partial_update_title(self, mock_update_entry, client):
        """Test partially updating journal entry (title only)"""
        mock_entry = {
            'id': 1,
            'title': 'New Title Only',
            'content': 'Original content',
            'updated_at': '2024-01-02T12:00:00'
        }
        mock_update_entry.return_value = mock_entry

        update_data = {
            'title': 'New Title Only'
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        mock_update_entry.assert_called_once_with(1, update_data)

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_partial_update_content(self, mock_update_entry, client):
        """Test partially updating journal entry (content only)"""
        mock_entry = {
            'id': 1,
            'title': 'Original Title',
            'content': 'New Content Only',
            'updated_at': '2024-01-02T12:00:00'
        }
        mock_update_entry.return_value = mock_entry

        update_data = {
            'content': 'New Content Only'
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        mock_update_entry.assert_called_once_with(1, update_data)

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_empty_json(self, mock_update_entry, client):
        """Test updating journal entry with empty JSON body"""
        mock_update_entry.side_effect = BadRequestError("No fields to update.")

        response = client.put(
            '/journals/1',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_update_journal_entry_no_json(self, client):
        """Test updating journal entry without JSON content type"""
        response = client.put('/journals/1')

        assert response.status_code >= 400

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_whitespace_title(self, mock_update_entry, client):
        """Test updating journal entry with whitespace-only title"""
        mock_update_entry.side_effect = BadRequestError("Title cannot be empty.")

        update_data = {
            'title': '   '
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_whitespace_content(self, mock_update_entry, client):
        """Test updating journal entry with whitespace-only content"""
        mock_update_entry.side_effect = BadRequestError("Content cannot be empty.")

        update_data = {
            'content': '   '
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_content_triggers_reanalysis(self, mock_update_entry, client):
        """Test updating content triggers emotion re-analysis"""
        mock_entry = {
            'id': 1,
            'title': 'Same Title',
            'content': 'New content for emotion analysis',
            'emotions': [
                {'emotion': 'joy', 'score': 0.7}
            ]
        }
        mock_update_entry.return_value = mock_entry

        update_data = {
            'content': 'New content for emotion analysis'
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        mock_update_entry.assert_called_once_with(1, update_data)

    def test_update_journal_entry_invalid_id(self, client):
        """Test updating journal entry with invalid ID format"""
        response = client.put(
            '/journals/invalid',
            data=json.dumps({'title': 'New Title'}),
            content_type='application/json'
        )

        # Flask routing raises NotFound which is caught by generic Exception handler returning 500
        assert response.status_code == 500

    @patch('app.journals.routes.JournalService.update_journal_entry')
    def test_update_journal_entry_service_error(self, mock_update_entry, client):
        """Test when service raises an error during update"""
        mock_update_entry.side_effect = Exception("Database error")

        update_data = {
            'title': 'Updated Title',
            'content': 'Updated content'
        }

        response = client.put(
            '/journals/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 500

    # ==================== DELETE /journals/<entry_id> Tests ====================

    @patch('app.journals.routes.JournalService.delete_journal_entry')
    def test_delete_journal_entry_success(self, mock_delete_entry, client):
        """Test successfully deleting a journal entry"""
        mock_delete_entry.return_value = None

        response = client.delete('/journals/1')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'Journal entry deleted successfully.'
        mock_delete_entry.assert_called_once_with(1)

    @patch('app.journals.routes.JournalService.delete_journal_entry')
    def test_delete_journal_entry_not_found(self, mock_delete_entry, client):
        """Test deleting non-existent journal entry"""
        mock_delete_entry.side_effect = NotFoundError("Journal entry not found.")

        response = client.delete('/journals/999')

        assert response.status_code == 404

    def test_delete_journal_entry_invalid_id(self, client):
        """Test deleting journal entry with invalid ID format"""
        response = client.delete('/journals/invalid')

        # Flask routing raises NotFound which is caught by generic Exception handler returning 500
        assert response.status_code == 500

    @patch('app.journals.routes.JournalService.delete_journal_entry')
    def test_delete_journal_entry_service_error(self, mock_delete_entry, client):
        """Test when service raises an error during deletion"""
        mock_delete_entry.side_effect = Exception("Database error")

        response = client.delete('/journals/1')

        assert response.status_code == 500

    # ==================== HTTP Method Tests ====================

    def test_journals_patch_method_not_allowed(self, client):
        """Test that PATCH method is not allowed"""
        response = client.patch('/journals/1')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_journals_root_delete_method_not_allowed(self, client):
        """Test that DELETE method is not allowed on /journals/ root"""
        response = client.delete('/journals/')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_journals_root_put_method_not_allowed(self, client):
        """Test that PUT method is not allowed on /journals/ root"""
        response = client.put('/journals/')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500
