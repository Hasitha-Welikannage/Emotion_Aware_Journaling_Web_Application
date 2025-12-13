from flask_login import current_user, logout_user
from ..extentions import db
from ..models import User
from ..utils.custom_exceptions import NotFoundError, BadRequestError

class UserService:

    @staticmethod
    def get_user():
        user = current_user

        if not user:
            raise NotFoundError(f'User not found.')
        
        return user.to_dict()
    
    @staticmethod
    def update_user(data):
        user = current_user

        if not user:
            raise NotFoundError("User not found.")

        if not data:
            raise BadRequestError("JSON body is required.")

        # First name (optional, but must be valid if provided)
        if 'first_name' in data:
            first_name = data.get('first_name')
            if not first_name or not first_name.strip():
                raise BadRequestError("First name cannot be empty.")
            user.first_name = first_name.strip()

        # Last name (optional, but must be valid if provided)
        if 'last_name' in data:
            last_name = data.get('last_name')
            if not last_name or not last_name.strip():
                raise BadRequestError("Last name cannot be empty.")
            user.last_name = last_name.strip()

        # Password change (fully optional)
        if 'new_password' in data:
            new_password = data.get('new_password')
            current_password = data.get('current_password')

            if not new_password or not new_password.strip():
                raise BadRequestError("New password cannot be empty.")

            if not current_password or not current_password.strip():
                raise BadRequestError("Current password is required.")

            if not user.check_password(current_password.strip()):
                raise BadRequestError("Current password is incorrect.")

            user.set_password(new_password.strip())

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return user.to_dict()

    
    @staticmethod
    def delete_user():
        user = current_user

        if not user:
            raise NotFoundError(f'User not found.')
        try:
            db.session.delete(user)
            db.session.commit()
        except:
            db.session.rollback()
            raise

        logout_user()