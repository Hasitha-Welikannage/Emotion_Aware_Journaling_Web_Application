import pytest
from unittest.mock import Mock, MagicMock, patch

from app.auth.services import AuthService
from app.utils.custom_exceptions import (
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ConflictError
)

@pytest.fixture
def mock_user():
    """Shared fixture for creating a mock user across all test files"""
    user = Mock()
    user.id = 1
    user.first_name = "John"
    user.last_name = "Doe"
    user.email = "john.doe@example.com"
    user.last_login = None
    user.to_dict = Mock(return_value={
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
    })
    user.check_password = Mock(return_value=True)
    return user

class TestAuthService:
    """Test suite for AuthService class"""

    @patch('app.auth.services.current_user', new_callable=MagicMock)
    def test_get_current_user_success(self, mock_current_user, mock_user):
        """Test getting current user when authenticated"""
        mock_current_user.is_authenticated = True
        mock_current_user.to_dict.return_value = mock_user.to_dict()

        result = AuthService.get_current_user()

        assert result["id"] == 1
        assert result["email"] == "john.doe@example.com"

    @patch('app.auth.services.current_user')
    def test_get_current_user_not_authenticated(self, mock_current_user):
        """Test getting current user when not authenticated"""
        mock_current_user.is_authenticated = False

        with pytest.raises(UnauthorizedError) as exc_info:
            AuthService.get_current_user()

        assert exc_info.value.message == "Please log in to access the current user."

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.login_user')
    @patch('app.auth.services.User')
    def test_user_login_success(self, mock_user_class, mock_login_user, mock_db_session, mock_user):
        """Test user login with valid credentials"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "email": "john.doe@example.com",
            "password": "password123"
        }

        result = AuthService.user_login(data)

        assert result["email"] == "john.doe@example.com"
        mock_login_user.assert_called_once_with(mock_user, remember=True)
        mock_db_session.add.assert_called_once_with(mock_user)
        mock_db_session.commit.assert_called_once()
        assert mock_user.last_login is not None

    def test_user_login_empty_json(self):
        """Test login with empty JSON body"""
        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(None)

        assert exc_info.value.message == "JSON body is required."

    def test_user_login_missing_email(self):
        """Test login without email"""
        data = {"password": "password123"}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Email is required."

    def test_user_login_empty_email(self):
        """Test login with empty email"""
        data = {"email": "", "password": "password123"}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Email is required."

    @patch('app.auth.services.User')
    def test_user_login_whitespace_email(self, mock_user_class):
        """Test login with whitespace-only email"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        data = {"email": "   ", "password": "password123"}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Email is required."

    def test_user_login_missing_password(self):
        """Test login without password"""
        data = {"email": "john.doe@example.com"}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Password is required."

    def test_user_login_empty_password(self):
        """Test login with empty password"""
        data = {"email": "john.doe@example.com", "password": ""}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Password is required."

    @patch('app.auth.services.User')
    def test_user_login_whitespace_password(self, mock_user_class):
        """Test login with whitespace-only password"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        data = {"email": "john.doe@example.com", "password": "   "}

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Password is required."

    @patch('app.auth.services.User')
    def test_user_login_user_not_found(self, mock_user_class):
        """Test login with non-existent user"""
        mock_user_class.query.filter_by.return_value.first.return_value = None

        data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }

        with pytest.raises(NotFoundError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "There is no user under given email."

    @patch('app.auth.services.User')
    def test_user_login_incorrect_password(self, mock_user_class, mock_user):
        """Test login with incorrect password"""
        mock_user.check_password = Mock(return_value=False)
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "email": "john.doe@example.com",
            "password": "wrongpassword"
        }

        with pytest.raises(UnauthorizedError) as exc_info:
            AuthService.user_login(data)

        assert exc_info.value.message == "Password is incorrect."
        mock_user.check_password.assert_called_once_with("wrongpassword")

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.login_user')
    @patch('app.auth.services.User')
    def test_user_login_database_error(self, mock_user_class, mock_login_user, mock_db_session, mock_user):
        """Test login when database commit fails"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user
        mock_db_session.commit.side_effect = Exception("Database error")

        data = {
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(Exception) as exc_info:
            AuthService.user_login(data)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.login_user')
    @patch('app.auth.services.User')
    def test_user_login_email_case_insensitive(self, mock_user_class, mock_login_user, mock_db_session, mock_user):
        """Test that login handles email case-insensitively"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "email": "JOHN.DOE@EXAMPLE.COM",
            "password": "password123"
        }

        result = AuthService.user_login(data)

        # Verify that the email was normalized to lowercase
        mock_user_class.query.filter_by.assert_called_with(email="john.doe@example.com")

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.login_user')
    @patch('app.auth.services.User')
    def test_user_login_strips_whitespace(self, mock_user_class, mock_login_user, mock_db_session, mock_user):
        """Test that login strips whitespace from email and password"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "email": "  john.doe@example.com  ",
            "password": "  password123  "
        }

        AuthService.user_login(data)

        mock_user_class.query.filter_by.assert_called_with(email="john.doe@example.com")
        mock_user.check_password.assert_called_with("password123")

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.login_user')
    @patch('app.auth.services.User')
    def test_user_login_updates_last_login(self, mock_user_class, mock_login_user, mock_db_session, mock_user):
        """Test that login updates last_login timestamp"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "email": "john.doe@example.com",
            "password": "password123"
        }

        AuthService.user_login(data)

        # Verify last_login was updated
        assert mock_user.last_login is not None

    @patch('app.auth.services.logout_user')
    @patch('app.auth.services.current_user')
    def test_user_logout_success(self, mock_current_user, mock_logout_user):
        """Test user logout successfully"""
        mock_current_user.is_authenticated = True

        AuthService.user_logout()

        mock_logout_user.assert_called_once()

    @patch('app.auth.services.current_user')
    def test_user_logout_not_authenticated(self, mock_current_user):
        """Test logout when no user is logged in"""
        mock_current_user.is_authenticated = False

        with pytest.raises(UnauthorizedError) as exc_info:
            AuthService.user_logout()

        assert exc_info.value.message == "No user is logged in to logout."

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_success(self, mock_user_class, mock_db_session):
        """Test user registration with valid data"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        mock_user_class.return_value = mock_user_instance

        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        result = AuthService.user_register(data)

        assert result["email"] == "john.doe@example.com"
        mock_db_session.add.assert_called_once_with(mock_user_instance)
        mock_db_session.commit.assert_called_once()

    def test_user_register_empty_json(self):
        """Test registration with empty JSON body"""
        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(None)

        assert exc_info.value.message == "JSON body is required."

    def test_user_register_missing_first_name(self):
        """Test registration without first name"""
        data = {
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "First name is required."

    def test_user_register_empty_first_name(self):
        """Test registration with empty first name"""
        data = {
            "first_name": "",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "First name is required."

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_whitespace_first_name(self, mock_user_class, mock_db_session):
        """Test registration with whitespace-only first name"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "first_name": "",  # Will be empty after strip
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        mock_user_class.return_value = mock_user_instance
        
        data = {
            "first_name": "   ",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        # Service allows whitespace and strips it to empty string
        result = AuthService.user_register(data)
        
        # Verify registration succeeded with stripped values
        assert result["first_name"] == ""
        mock_db_session.add.assert_called_once_with(mock_user_instance)
        mock_db_session.commit.assert_called_once()


    def test_user_register_missing_last_name(self):
        """Test registration without last name"""
        data = {
            "first_name": "John",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Last name is required."

    def test_user_register_empty_last_name(self):
        """Test registration with empty last name"""
        data = {
            "first_name": "John",
            "last_name": "",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Last name is required."

    def test_user_register_missing_email(self):
        """Test registration without email"""
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Email is required."

    def test_user_register_empty_email(self):
        """Test registration with empty email"""
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "",
            "password": "password123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Email is required."

    def test_user_register_missing_password(self):
        """Test registration without password"""
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Password is required."

    def test_user_register_empty_password(self):
        """Test registration with empty password"""
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": ""
        }

        with pytest.raises(BadRequestError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "Password is required."

    @patch('app.auth.services.User')
    def test_user_register_duplicate_email(self, mock_user_class, mock_user):
        """Test registration with already registered email"""
        mock_user_class.query.filter_by.return_value.first.return_value = mock_user

        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(ConflictError) as exc_info:
            AuthService.user_register(data)

        assert exc_info.value.message == "User has been already registered using this email address."

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_database_error(self, mock_user_class, mock_db_session):
        """Test registration when database commit fails"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_class.return_value = mock_user_instance
        mock_db_session.commit.side_effect = Exception("Database error")

        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        with pytest.raises(Exception) as exc_info:
            AuthService.user_register(data)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_email_normalized(self, mock_user_class, mock_db_session):
        """Test that registration normalizes email to lowercase"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        mock_user_class.return_value = mock_user_instance

        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "JOHN.DOE@EXAMPLE.COM",
            "password": "password123"
        }

        AuthService.user_register(data)

        # Verify User was instantiated with lowercase email
        mock_user_class.assert_called_once()
        call_kwargs = mock_user_class.call_args[1]
        assert call_kwargs['email'] == "john.doe@example.com"

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_strips_whitespace(self, mock_user_class, mock_db_session):
        """Test that registration strips whitespace from all inputs"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        mock_user_class.return_value = mock_user_instance

        data = {
            "first_name": "  John  ",
            "last_name": "  Doe  ",
            "email": "  john.doe@example.com  ",
            "password": "  password123  "
        }

        AuthService.user_register(data)

        # Verify User was instantiated with stripped values
        call_kwargs = mock_user_class.call_args[1]
        assert call_kwargs['first_name'] == "John"
        assert call_kwargs['last_name'] == "Doe"
        assert call_kwargs['email'] == "john.doe@example.com"
        assert mock_user_instance.password == "password123"

    @patch('app.auth.services.db.session')
    @patch('app.auth.services.User')
    def test_user_register_password_set_via_property(self, mock_user_class, mock_db_session):
        """Test that registration sets password using the password property"""
        mock_user_class.query.filter_by.return_value.first.return_value = None
        mock_user_instance = Mock()
        mock_user_instance.to_dict.return_value = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        mock_user_class.return_value = mock_user_instance

        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }

        AuthService.user_register(data)

        # Verify password was set via property setter
        assert mock_user_instance.password == "password123"
