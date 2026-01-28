import pytest
from unittest.mock import MagicMock, patch

from app.auth.services import AuthService
from app.utils.custom_exceptions import (
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    ConflictError,
)

@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = 1
    user.email = "test@example.com"
    user.is_authenticated = True
    user.to_dict.return_value = {
        "id": 1,
        "email": "test@example.com"
    }
    user.check_password.return_value = True
    return user

@pytest.fixture
def anonymous_user():
    user = MagicMock()
    user.is_authenticated = False
    return user

def test_get_current_user_success(mock_user):
    with patch("app.services.auth_service.current_user", mock_user):
        result = AuthService.get_current_user()
        assert result["email"] == "test@example.com"

def test_get_current_user_unauthorized(anonymous_user):
    with patch("app.services.auth_service.current_user", anonymous_user):
        with pytest.raises(UnauthorizedError):
            AuthService.get_current_user()

def test_user_login_success(mock_user):
    data = {
        "email": "TEST@EXAMPLE.COM ",
        "password": "secret"
    }

    with patch("app.services.auth_service.User.query") as query, \
         patch("app.services.auth_service.login_user") as login, \
         patch("app.services.auth_service.db.session.add") as add, \
         patch("app.services.auth_service.db.session.commit"):

        query.filter_by.return_value.first.return_value = mock_user

        result = AuthService.user_login(data)

        login.assert_called_once_with(mock_user, remember=True)
        add.assert_called_once_with(mock_user)
        assert result["email"] == "test@example.com"

def test_user_login_no_body():
    with pytest.raises(BadRequestError):
        AuthService.user_login(None)

def test_user_login_missing_email():
    with pytest.raises(BadRequestError):
        AuthService.user_login({"password": "x"})

def test_user_login_missing_password():
    with pytest.raises(BadRequestError):
        AuthService.user_login({"email": "x@test.com"})

def test_user_login_user_not_found():
    with patch("app.services.auth_service.User.query") as query:
        query.filter_by.return_value.first.return_value = None

        with pytest.raises(NotFoundError):
            AuthService.user_login({
                "email": "x@test.com",
                "password": "x"
            })

def test_user_login_wrong_password(mock_user):
    mock_user.check_password.return_value = False

    with patch("app.services.auth_service.User.query") as query:
        query.filter_by.return_value.first.return_value = mock_user

        with pytest.raises(UnauthorizedError):
            AuthService.user_login({
                "email": "x@test.com",
                "password": "wrong"
            })

def test_user_login_db_error(mock_user):
    with patch("app.services.auth_service.User.query") as query, \
         patch("app.services.auth_service.login_user"), \
         patch("app.services.auth_service.db.session.commit",
               side_effect=Exception), \
         patch("app.services.auth_service.db.session.rollback") as rollback:

        query.filter_by.return_value.first.return_value = mock_user

        with pytest.raises(Exception):
            AuthService.user_login({
                "email": "x@test.com",
                "password": "x"
            })

        rollback.assert_called_once()

def test_user_logout_success(mock_user):
    with patch("app.services.auth_service.current_user", mock_user), \
         patch("app.services.auth_service.logout_user") as logout:

        AuthService.user_logout()
        logout.assert_called_once()

def test_user_logout_not_authenticated(anonymous_user):
    with patch("app.services.auth_service.current_user", anonymous_user):
        with pytest.raises(UnauthorizedError):
            AuthService.user_logout()

def test_user_register_success():
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "John@Example.com",
        "password": "secret"
    }

    with patch("app.services.auth_service.User.query") as query, \
         patch("app.services.auth_service.User") as UserMock, \
         patch("app.services.auth_service.db.session.add") as add, \
         patch("app.services.auth_service.db.session.commit"):

        query.filter_by.return_value.first.return_value = None

        instance = MagicMock()
        instance.to_dict.return_value = {"email": "john@example.com"}
        UserMock.return_value = instance

        result = AuthService.user_register(data)

        add.assert_called_once_with(instance)
        assert result["email"] == "john@example.com"

def test_user_register_conflict(mock_user):
    with patch("app.services.auth_service.User.query") as query:
        query.filter_by.return_value.first.return_value = mock_user

        with pytest.raises(ConflictError):
            AuthService.user_register({
                "first_name": "a",
                "last_name": "b",
                "email": "a@b.com",
                "password": "x"
            })

def test_user_register_missing_email():
    with pytest.raises(BadRequestError):
        AuthService.user_register({
            "first_name": "a",
            "last_name": "b",
            "password": "x"
        })
