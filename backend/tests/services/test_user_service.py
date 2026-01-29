import pytest
from unittest.mock import Mock, MagicMock, patch

from app.users.services import UserService
from app.utils.custom_exceptions import (
    BadRequestError,
    NotFoundError
)


@pytest.fixture
def mock_user():
    """Fixture for creating a mock user"""
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


class TestUserService:
    """Test suite for UserService class"""

    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_get_user_success(self, mock_current_user, mock_user):
        """Test getting user successfully"""
        mock_current_user.to_dict.return_value = mock_user.to_dict()

        result = UserService.get_user()

        assert result["id"] == 1
        assert result["email"] == "john.doe@example.com"
        mock_current_user.to_dict.assert_called_once()

    @patch('app.users.services.current_user', None)
    def test_get_user_not_found(self):
        """Test getting user when no user is logged in"""
        with pytest.raises(NotFoundError) as exc_info:
            UserService.get_user()

        assert exc_info.value.message == "User not found."

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_first_name(self, mock_current_user, mock_db_session):
        """Test updating user's first name"""
        mock_current_user.first_name = "John"
        mock_current_user.to_dict.return_value = {
            "id": 1,
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }

        data = {"first_name": "Jane"}
        result = UserService.update_user(data)

        assert result["first_name"] == "Jane"
        assert mock_current_user.first_name == "Jane"
        mock_db_session.commit.assert_called_once()

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_last_name(self, mock_current_user, mock_db_session):
        """Test updating user's last name"""
        mock_current_user.last_name = "Doe"
        mock_current_user.to_dict.return_value = {
            "id": 1,
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.doe@example.com"
        }

        data = {"last_name": "Smith"}
        result = UserService.update_user(data)

        assert result["last_name"] == "Smith"
        assert mock_current_user.last_name == "Smith"
        mock_db_session.commit.assert_called_once()

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_both_names(self, mock_current_user, mock_db_session):
        """Test updating both first and last name"""
        mock_current_user.first_name = "John"
        mock_current_user.last_name = "Doe"
        mock_current_user.to_dict.return_value = {
            "id": 1,
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "john.doe@example.com"
        }

        data = {"first_name": "Jane", "last_name": "Smith"}
        result = UserService.update_user(data)

        assert result["first_name"] == "Jane"
        assert result["last_name"] == "Smith"
        mock_db_session.commit.assert_called_once()

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_password(self, mock_current_user, mock_db_session, mock_user):
        """Test updating user's password"""
        mock_current_user.check_password = Mock(return_value=True)
        mock_current_user.to_dict.return_value = mock_user.to_dict()

        data = {
            "current_password": "oldpass123",
            "new_password": "newpass456"
        }
        result = UserService.update_user(data)

        mock_current_user.check_password.assert_called_once_with("oldpass123")
        assert mock_current_user.password == "newpass456"
        mock_db_session.commit.assert_called_once()

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_name_and_password(self, mock_current_user, mock_db_session):
        """Test updating name and password together"""
        mock_current_user.check_password = Mock(return_value=True)
        mock_current_user.to_dict.return_value = {
            "id": 1,
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }

        data = {
            "first_name": "Jane",
            "current_password": "oldpass123",
            "new_password": "newpass456"
        }
        result = UserService.update_user(data)

        assert result["first_name"] == "Jane"
        mock_current_user.check_password.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @patch('app.users.services.current_user')
    def test_update_user_empty_json(self, mock_current_user):
        """Test updating user with empty JSON body"""
        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(None)

        assert exc_info.value.message == "JSON body is required."

    @patch('app.users.services.current_user')
    def test_update_user_empty_dict(self, mock_current_user):
        """Test updating user with empty dictionary"""
        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user({})

        assert exc_info.value.message == "JSON body is required."

    @patch('app.users.services.current_user')
    def test_update_user_empty_first_name(self, mock_current_user):
        """Test updating user with empty first name"""
        data = {"first_name": "  "}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "First name cannot be empty."

    @patch('app.users.services.current_user')
    def test_update_user_empty_string_first_name(self, mock_current_user):
        """Test updating user with empty string first name"""
        data = {"first_name": ""}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "First name cannot be empty."

    @patch('app.users.services.current_user')
    def test_update_user_empty_last_name(self, mock_current_user):
        """Test updating user with empty last name"""
        data = {"last_name": ""}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "Last name cannot be empty."

    @patch('app.users.services.current_user')
    def test_update_user_whitespace_last_name(self, mock_current_user):
        """Test updating user with whitespace-only last name"""
        data = {"last_name": "   "}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "Last name cannot be empty."

    @patch('app.users.services.current_user')
    def test_update_user_empty_new_password(self, mock_current_user):
        """Test updating user with empty new password"""
        data = {"new_password": "  ", "current_password": "oldpass"}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "New password cannot be empty."

    @patch('app.users.services.current_user')
    def test_update_user_missing_current_password(self, mock_current_user):
        """Test updating password without providing current password"""
        data = {"new_password": "newpass123"}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "Current password is required."

    @patch('app.users.services.current_user')
    def test_update_user_empty_current_password(self, mock_current_user):
        """Test updating password with empty current password"""
        data = {"new_password": "newpass123", "current_password": ""}

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "Current password is required."

    @patch('app.users.services.current_user')
    def test_update_user_incorrect_current_password(self, mock_current_user):
        """Test updating password with incorrect current password"""
        mock_current_user.check_password = Mock(return_value=False)

        data = {
            "current_password": "wrongpass",
            "new_password": "newpass123"
        }

        with pytest.raises(BadRequestError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "Current password is incorrect."
        mock_current_user.check_password.assert_called_once_with("wrongpass")

    @patch('app.users.services.current_user', None)
    def test_update_user_not_found(self):
        """Test updating user when no user is logged in"""
        data = {"first_name": "Jane"}

        with pytest.raises(NotFoundError) as exc_info:
            UserService.update_user(data)

        assert exc_info.value.message == "User not found."

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user')
    def test_update_user_database_error(self, mock_current_user, mock_db_session, mock_user):
        """Test update user when database commit fails"""
        mock_current_user.to_dict.return_value = mock_user.to_dict()
        mock_db_session.commit.side_effect = Exception("Database error")

        data = {"first_name": "Jane"}

        with pytest.raises(Exception) as exc_info:
            UserService.update_user(data)

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user', new_callable=MagicMock)
    def test_update_user_strips_whitespace(self, mock_current_user, mock_db_session):
        """Test that update strips whitespace from inputs"""
        mock_current_user.to_dict.return_value = {
            "id": 1,
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "john.doe@example.com"
        }

        data = {"first_name": "  Jane  ", "last_name": "  Smith  "}
        result = UserService.update_user(data)

        assert mock_current_user.first_name == "Jane"
        assert mock_current_user.last_name == "Smith"

    @patch('app.users.services.logout_user')
    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user')
    def test_delete_user_success(self, mock_current_user, mock_db_session, mock_logout):
        """Test deleting user successfully"""
        mock_current_user.id = 1

        UserService.delete_user()

        mock_db_session.delete.assert_called_once_with(mock_current_user)
        mock_db_session.commit.assert_called_once()
        mock_logout.assert_called_once()

    @patch('app.users.services.current_user', None)
    def test_delete_user_not_found(self):
        """Test deleting user when no user is logged in"""
        with pytest.raises(NotFoundError) as exc_info:
            UserService.delete_user()

        assert exc_info.value.message == "User not found."

    @patch('app.users.services.db.session')
    @patch('app.users.services.current_user')
    def test_delete_user_database_error(self, mock_current_user, mock_db_session):
        """Test delete user when database commit fails"""
        mock_db_session.commit.side_effect = Exception("Database error")

        with pytest.raises(Exception) as exc_info:
            UserService.delete_user()

        assert str(exc_info.value) == "Database error"
        mock_db_session.rollback.assert_called_once()


