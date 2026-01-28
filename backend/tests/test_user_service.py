import pytest
from unittest.mock import MagicMock, patch

from app.users.services import UserService
from app.utils.custom_exceptions import NotFoundError, BadRequestError

@pytest.fixture
def mock_user():
    user = MagicMock()
    user.first_name = "John"
    user.last_name = "Doe"
    user.to_dict.return_value = {
        "first_name": "John",
        "last_name": "Doe"
    }
    user.check_password.return_value = True
    return user

def test_get_user_success(mock_user):
    with patch("app.services.user_service.current_user", mock_user):
        result = UserService.get_user()
        assert result["first_name"] == "John"

def test_get_user_not_found():
    with patch("app.services.user_service.current_user", None):
        with pytest.raises(NotFoundError):
            UserService.get_user()

def test_update_user_first_and_last_name(mock_user):
    data = {
        "first_name": " Jane ",
        "last_name": " Smith "
    }

    with patch("app.services.user_service.current_user", mock_user), \
         patch("app.services.user_service.db.session.commit"):

        result = UserService.update_user(data)

        assert mock_user.first_name == "Jane"
        assert mock_user.last_name == "Smith"
        assert result["first_name"] == "John"  # returned from mocked to_dict

def test_update_user_not_found():
    with patch("app.services.user_service.current_user", None):
        with pytest.raises(NotFoundError):
            UserService.update_user({"first_name": "Jane"})

def test_update_user_empty_body(mock_user):
    with patch("app.services.user_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            UserService.update_user({})

def test_update_user_invalid_first_name(mock_user):
    with patch("app.services.user_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            UserService.update_user({"first_name": "   "})

def test_update_user_password_success(mock_user):
    data = {
        "current_password": "oldpass",
        "new_password": "newpass"
    }

    with patch("app.services.user_service.current_user", mock_user), \
         patch("app.services.user_service.db.session.commit"):

        UserService.update_user(data)
        mock_user.check_password.assert_called_once_with("oldpass")
        assert mock_user.password == "newpass"

def test_update_user_wrong_current_password(mock_user):
    mock_user.check_password.return_value = False

    data = {
        "current_password": "wrong",
        "new_password": "newpass"
    }

    with patch("app.services.user_service.current_user", mock_user):
        with pytest.raises(BadRequestError):
            UserService.update_user(data)

def test_update_user_db_error_rolls_back(mock_user):
    with patch("app.services.user_service.current_user", mock_user), \
         patch("app.services.user_service.db.session.commit", side_effect=Exception), \
         patch("app.services.user_service.db.session.rollback") as rollback:

        with pytest.raises(Exception):
            UserService.update_user({"first_name": "Jane"})

        rollback.assert_called_once()

def test_delete_user_success(mock_user):
    with patch("app.services.user_service.current_user", mock_user), \
         patch("app.services.user_service.db.session.delete") as delete, \
         patch("app.services.user_service.db.session.commit") as commit, \
         patch("app.services.user_service.logout_user") as logout:

        UserService.delete_user()

        delete.assert_called_once_with(mock_user)
        commit.assert_called_once()
        logout.assert_called_once()

def test_delete_user_not_found():
    with patch("app.services.user_service.current_user", None):
        with pytest.raises(NotFoundError):
            UserService.delete_user()

def test_delete_user_db_error(mock_user):
    with patch("app.services.user_service.current_user", mock_user), \
         patch("app.services.user_service.db.session.delete"), \
         patch("app.services.user_service.db.session.commit", side_effect=Exception), \
         patch("app.services.user_service.db.session.rollback") as rollback:

        with pytest.raises(Exception):
            UserService.delete_user()

        rollback.assert_called_once()
