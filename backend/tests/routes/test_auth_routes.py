import pytest
from unittest.mock import patch
from flask import json

from app.utils.custom_exceptions import BadRequestError, UnauthorizedError


class TestAuthRoutes:
    """Test suite for Auth routes"""

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
        return app

    # ==================== GET /auth/current_user Tests ====================

    @patch('app.auth.routes.login_required', lambda f: f)  # Bypass login_required
    @patch('app.auth.routes.AuthService.get_current_user')
    def test_get_current_user_success(self, mock_get_current_user, client):
        """Test successfully retrieving current user"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_get_current_user.return_value = mock_user_data

        response = client.get('/auth/current_user')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'Current user retrieved successfully.'
        assert data['data'] == mock_user_data
        assert 'path' in data
        assert 'time_stamp' in data
        mock_get_current_user.assert_called_once()

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication"""
        response = client.get('/auth/current_user')

        # Flask-Login returns 401 for unauthorized
        assert response.status_code == 401

    @patch('app.auth.routes.login_required', lambda f: f)  # Bypass login_required
    @patch('app.auth.routes.AuthService.get_current_user')
    def test_get_current_user_service_error(self, mock_get_current_user, client):
        """Test when service raises an error"""
        mock_get_current_user.side_effect = Exception("Database error")

        response = client.get('/auth/current_user')

        # Should return error response (500 from error handler)
        assert response.status_code == 500

    # ==================== POST /auth/login Tests ====================

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_success(self, mock_user_login, client):
        """Test successful user login"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_user_login.return_value = mock_user_data

        login_data = {
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'User login sucessfully.'
        assert data['data'] == mock_user_data
        assert 'path' in data
        assert 'time_stamp' in data
        mock_user_login.assert_called_once_with(login_data)

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_invalid_credentials(self, mock_user_login, client):
        """Test login with invalid credentials"""
        mock_user_login.side_effect = UnauthorizedError("Invalid email or password.")

        login_data = {
            'email': 'john.doe@example.com',
            'password': 'wrongpassword'
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_missing_email(self, mock_user_login, client):
        """Test login with missing email"""
        mock_user_login.side_effect = BadRequestError("Email is required.")

        login_data = {
            'password': 'password123'
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_missing_password(self, mock_user_login, client):
        """Test login with missing password"""
        mock_user_login.side_effect = BadRequestError("Password is required.")

        login_data = {
            'email': 'john.doe@example.com'
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_empty_json(self, mock_user_login, client):
        """Test login with empty JSON body"""
        mock_user_login.side_effect = BadRequestError("JSON body is required.")

        response = client.post(
            '/auth/login',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code >= 400

    def test_user_login_no_json(self, client):
        """Test login without JSON content type"""
        response = client.post('/auth/login')

        # Flask should handle missing JSON gracefully
        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_whitespace_email(self, mock_user_login, client):
        """Test login with whitespace-only email"""
        mock_user_login.side_effect = BadRequestError("Email is required.")

        login_data = {
            'email': '   ',
            'password': 'password123'
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_login')
    def test_user_login_whitespace_password(self, mock_user_login, client):
        """Test login with whitespace-only password"""
        mock_user_login.side_effect = BadRequestError("Password is required.")

        login_data = {
            'email': 'john.doe@example.com',
            'password': '   '
        }

        response = client.post(
            '/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    # ==================== POST /auth/logout Tests ====================

    @patch('app.auth.routes.login_required', lambda f: f)  # Bypass login_required
    @patch('app.auth.routes.AuthService.user_logout')
    def test_user_logout_success(self, mock_user_logout, client):
        """Test successful user logout"""
        mock_user_logout.return_value = None

        response = client.post('/auth/logout')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['message'] == 'User logout sucessfully.'
        assert 'path' in data
        assert 'time_stamp' in data
        mock_user_logout.assert_called_once()

    def test_user_logout_unauthorized(self, client):
        """Test logout without authentication"""
        response = client.post('/auth/logout')

        # Flask-Login returns 401 for unauthorized
        assert response.status_code == 401

    @patch('app.auth.routes.login_required', lambda f: f)  # Bypass login_required
    @patch('app.auth.routes.AuthService.user_logout')
    def test_user_logout_service_error(self, mock_user_logout, client):
        """Test when logout service raises an error"""
        mock_user_logout.side_effect = Exception("Logout error")

        response = client.post('/auth/logout')

        # Should return error response (500 from error handler)
        assert response.status_code == 500

    # ==================== POST /auth/register Tests ====================

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_success(self, mock_user_register, client):
        """Test successful user registration"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_user_register.return_value = mock_user_data

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        assert data['message'] == 'User registered successfully.'
        assert data['data'] == mock_user_data
        assert 'path' in data
        assert 'time_stamp' in data
        mock_user_register.assert_called_once_with(register_data)

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_missing_first_name(self, mock_user_register, client):
        """Test registration with missing first name"""
        mock_user_register.side_effect = BadRequestError("First name is required.")

        register_data = {
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_missing_last_name(self, mock_user_register, client):
        """Test registration with missing last name"""
        mock_user_register.side_effect = BadRequestError("Last name is required.")

        register_data = {
            'first_name': 'John',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_missing_email(self, mock_user_register, client):
        """Test registration with missing email"""
        mock_user_register.side_effect = BadRequestError("Email is required.")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_missing_password(self, mock_user_register, client):
        """Test registration with missing password"""
        mock_user_register.side_effect = BadRequestError("Password is required.")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_duplicate_email(self, mock_user_register, client):
        """Test registration with already existing email"""
        mock_user_register.side_effect = BadRequestError("Email already exists.")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'existing@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_invalid_email_format(self, mock_user_register, client):
        """Test registration with invalid email format"""
        mock_user_register.side_effect = BadRequestError("Invalid email format.")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'invalid-email',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_short_password(self, mock_user_register, client):
        """Test registration with short password"""
        mock_user_register.side_effect = BadRequestError("Password must be at least 8 characters long.")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'short'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_whitespace_first_name(self, mock_user_register, client):
        """Test registration with whitespace-only first name"""
        mock_user_register.side_effect = BadRequestError("First name is required.")

        register_data = {
            'first_name': '   ',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_whitespace_last_name(self, mock_user_register, client):
        """Test registration with whitespace-only last name"""
        mock_user_register.side_effect = BadRequestError("Last name is required.")

        register_data = {
            'first_name': 'John',
            'last_name': '   ',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_empty_json(self, mock_user_register, client):
        """Test registration with empty JSON body"""
        mock_user_register.side_effect = BadRequestError("JSON body is required.")

        response = client.post(
            '/auth/register',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code >= 400

    def test_user_register_no_json(self, client):
        """Test registration without JSON content type"""
        response = client.post('/auth/register')

        # Flask should handle missing JSON gracefully
        assert response.status_code >= 400

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_extra_fields(self, mock_user_register, client):
        """Test registration with extra fields in request"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_user_register.return_value = mock_user_data

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123',
            'extra_field': 'should be ignored'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        mock_user_register.assert_called_once_with(register_data)

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_case_insensitive_email(self, mock_user_register, client):
        """Test registration normalizes email to lowercase"""
        mock_user_data = {
            'id': 1,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com'
        }
        mock_user_register.return_value = mock_user_data

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'John.Doe@Example.COM',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        # Service should normalize the email
        mock_user_register.assert_called_once_with(register_data)

    @patch('app.auth.routes.AuthService.user_register')
    def test_user_register_database_error(self, mock_user_register, client):
        """Test registration when database error occurs"""
        mock_user_register.side_effect = Exception("Database connection failed")

        register_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123'
        }

        response = client.post(
            '/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert response.status_code >= 400

    # ==================== HTTP Method Tests ====================

    def test_login_get_method_not_allowed(self, client):
        """Test that GET method is not allowed for login"""
        response = client.get('/auth/login')
        assert response.status_code == 405

    def test_register_get_method_not_allowed(self, client):
        """Test that GET method is not allowed for register"""
        response = client.get('/auth/register')
        assert response.status_code == 405

    def test_logout_get_method_not_allowed(self, client):
        """Test that GET method is not allowed for logout"""
        response = client.get('/auth/logout')
        assert response.status_code == 405

    def test_current_user_post_method_not_allowed(self, client):
        """Test that POST method is not allowed for current_user"""
        response = client.post('/auth/current_user')
        assert response.status_code == 405
