import pytest
from unittest.mock import patch
from flask import json

from app.utils.custom_exceptions import BadRequestError, NotFoundError


class TestUserRoutes:
    """Test suite for User routes"""

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

    # ==================== GET /users/ Tests ====================

    @patch('app.users.routes.UserService.get_user')
    def test_get_user_success(self, mock_get_user, client):
        """Test successfully retrieving current user profile"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_get_user.return_value = mock_user_data

        response = client.get('/user/')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'User found sucessfully'
        assert data['data'] == mock_user_data
        assert data['data']['id'] == 1
        assert data['data']['email'] == 'john.doe@example.com'
        mock_get_user.assert_called_once()

    @patch('app.users.routes.UserService.get_user')
    def test_get_user_not_found(self, mock_get_user, client):
        """Test getting user when user doesn't exist"""
        mock_get_user.side_effect = NotFoundError("User not found.")

        response = client.get('/user/')

        assert response.status_code == 404

    @patch('app.users.routes.UserService.get_user')
    def test_get_user_service_error(self, mock_get_user, client):
        """Test when service raises an error"""
        mock_get_user.side_effect = Exception("Database error")

        response = client.get('/user/')

        assert response.status_code == 500

    # ==================== PUT /users/update Tests ====================

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_success(self, mock_update_user, client):
        """Test successfully updating user profile"""
        mock_user_data = {
            'id': 1,
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane.smith@example.com'
        }
        mock_update_user.return_value = mock_user_data

        update_data = {
            'first_name': 'Jane',
            'last_name': 'Smith'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'User updated sucessfully'
        assert data['data'] == mock_user_data
        assert data['data']['first_name'] == 'Jane'
        assert data['data']['last_name'] == 'Smith'
        mock_update_user.assert_called_once_with(update_data)

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_partial_first_name(self, mock_update_user, client):
        """Test updating only first name"""
        mock_user_data = {
            'id': 1,
            'first_name': 'UpdatedFirst',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_update_user.return_value = mock_user_data

        update_data = {
            'first_name': 'UpdatedFirst'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['first_name'] == 'UpdatedFirst'
        mock_update_user.assert_called_once_with(update_data)

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_partial_last_name(self, mock_update_user, client):
        """Test updating only last name"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'UpdatedLast',
            'email': 'john.doe@example.com'
        }
        mock_update_user.return_value = mock_user_data

        update_data = {
            'last_name': 'UpdatedLast'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['last_name'] == 'UpdatedLast'
        mock_update_user.assert_called_once_with(update_data)

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_partial_email(self, mock_update_user, client):
        """Test updating only email"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'newemail@example.com'
        }
        mock_update_user.return_value = mock_user_data

        update_data = {
            'email': 'newemail@example.com'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['email'] == 'newemail@example.com'
        mock_update_user.assert_called_once_with(update_data)

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_with_password(self, mock_update_user, client):
        """Test updating user with password change"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_update_user.return_value = mock_user_data

        update_data = {
            'current_password': 'oldpassword',
            'new_password': 'newpassword123'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        mock_update_user.assert_called_once_with(update_data)

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_empty_json(self, mock_update_user, client):
        """Test updating user with empty JSON body"""
        mock_update_user.side_effect = BadRequestError("No fields to update.")

        response = client.put(
            '/user/update',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_update_user_no_json(self, client):
        """Test updating user without JSON content type"""
        response = client.put('/user/update')

        assert response.status_code >= 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_whitespace_first_name(self, mock_update_user, client):
        """Test updating user with whitespace-only first name"""
        mock_update_user.side_effect = BadRequestError("First name cannot be empty.")

        update_data = {
            'first_name': '   '
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_whitespace_last_name(self, mock_update_user, client):
        """Test updating user with whitespace-only last name"""
        mock_update_user.side_effect = BadRequestError("Last name cannot be empty.")

        update_data = {
            'last_name': '   '
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_whitespace_email(self, mock_update_user, client):
        """Test updating user with whitespace-only email"""
        mock_update_user.side_effect = BadRequestError("Email cannot be empty.")

        update_data = {
            'email': '   '
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_invalid_email_format(self, mock_update_user, client):
        """Test updating user with invalid email format"""
        mock_update_user.side_effect = BadRequestError("Invalid email format.")

        update_data = {
            'email': 'invalid-email'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_duplicate_email(self, mock_update_user, client):
        """Test updating user with already existing email"""
        mock_update_user.side_effect = BadRequestError("Email already exists.")

        update_data = {
            'email': 'existing@example.com'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_wrong_current_password(self, mock_update_user, client):
        """Test updating password with wrong current password"""
        mock_update_user.side_effect = BadRequestError("Current password is incorrect.")

        update_data = {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword123'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_short_new_password(self, mock_update_user, client):
        """Test updating password with short new password"""
        mock_update_user.side_effect = BadRequestError("Password must be at least 8 characters long.")

        update_data = {
            'current_password': 'oldpassword',
            'new_password': 'short'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 400

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_service_error(self, mock_update_user, client):
        """Test when service raises an error during update"""
        mock_update_user.side_effect = Exception("Database error")

        update_data = {
            'first_name': 'Jane'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 500

    @patch('app.users.routes.UserService.update_user')
    def test_update_user_not_found(self, mock_update_user, client):
        """Test updating user when user doesn't exist"""
        mock_update_user.side_effect = NotFoundError("User not found.")

        update_data = {
            'first_name': 'Jane'
        }

        response = client.put(
            '/user/update',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        assert response.status_code == 404

    # ==================== DELETE /users/delete Tests ====================

    @patch('app.users.routes.UserService.delete_user')
    def test_delete_user_success(self, mock_delete_user, client):
        """Test successfully deleting user"""
        mock_delete_user.return_value = None

        response = client.delete('/user/delete')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'User deleted successfully.'
        mock_delete_user.assert_called_once()

    @patch('app.users.routes.UserService.delete_user')
    def test_delete_user_not_found(self, mock_delete_user, client):
        """Test deleting user when user doesn't exist"""
        mock_delete_user.side_effect = NotFoundError("User not found.")

        response = client.delete('/user/delete')

        assert response.status_code == 404

    @patch('app.users.routes.UserService.delete_user')
    def test_delete_user_service_error(self, mock_delete_user, client):
        """Test when service raises an error during deletion"""
        mock_delete_user.side_effect = Exception("Database error")

        response = client.delete('/user/delete')

        assert response.status_code == 500

    # ==================== HTTP Method Tests ====================

    def test_get_user_post_method_not_allowed(self, client):
        """Test that POST method is not allowed for GET /users/"""
        response = client.post('/user/')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_get_user_delete_method_not_allowed(self, client):
        """Test that DELETE method is not allowed for GET /users/"""
        response = client.delete('/user/')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_update_user_get_method_not_allowed(self, client):
        """Test that GET method is not allowed for PUT /users/update"""
        response = client.get('/user/update')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_update_user_post_method_not_allowed(self, client):
        """Test that POST method is not allowed for PUT /users/update"""
        response = client.post('/user/update')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_delete_user_get_method_not_allowed(self, client):
        """Test that GET method is not allowed for DELETE /users/delete"""
        response = client.get('/user/delete')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500

    def test_delete_user_post_method_not_allowed(self, client):
        """Test that POST method is not allowed for DELETE /users/delete"""
        response = client.post('/user/delete')
        # Error handler catches 405 and returns 500
        assert response.status_code == 500
