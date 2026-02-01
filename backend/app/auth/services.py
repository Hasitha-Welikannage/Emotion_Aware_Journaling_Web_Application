import re
from ..models import User
from ..extentions import db
from datetime import datetime, timezone
from flask_login import login_user, logout_user, current_user
from ..utils.custom_exceptions import ConflictError, UnauthorizedError, BadRequestError

class AuthService():

    @staticmethod
    def get_current_user():
        # Check if user is authenticated
        if not current_user.is_authenticated:
            raise UnauthorizedError('Please log in to access the current user.')

        return current_user.to_dict()
    
    @staticmethod
    def user_login(data):
        if not data:
            raise BadRequestError("JSON body is required.")
        if not 'email' in data or not data.get('email'):
            raise BadRequestError(message="Email is required.")
        if not 'password' in data or not data.get('password'):
            raise BadRequestError(message="Password is required.")
        
        email = data.get('email').strip().lower()
        password = data.get('password').strip()

        if not email:
            raise BadRequestError(message="Email is required.")
        if not password:
            raise BadRequestError(message="Password is required.")

        user = User.query.filter_by(email=email).first()

        # Check if user exists
        if not user:
            raise UnauthorizedError(message='Invalid email or password.')    

        # Check if password is correct
        if not user.check_password(password):
            raise UnauthorizedError(message='Invalid email or password.')
        
        login_user(user, remember=True)

        user.last_login = datetime.now(timezone.utc)

        try:
            db.session.add(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return user.to_dict()
    
    @staticmethod
    def user_logout():
         # Check if user is authenticated
        if not current_user.is_authenticated:
            raise UnauthorizedError(message='No user is logged in to logout.')

        logout_user()

    @staticmethod
    def user_register(data):
        if not data:
            raise BadRequestError("JSON body is required.")
        if not 'first_name' in data or not data.get('first_name'):
            raise BadRequestError(message="First name is required.")
        if not 'last_name' in data or not data.get('last_name'):
            raise BadRequestError(message="Last name is required.")
        if not 'email' in data or not data.get('email'):
            raise BadRequestError(message="Email is required.")
        if not 'password' in data or not data.get('password'):
            raise BadRequestError(message="Password is required.")
        
        first_name = data.get('first_name').strip()
        last_name = data.get('last_name').strip()
        email = data.get('email').strip().lower()
        password = data.get('password').strip()

        if not first_name:
            raise BadRequestError(message="First name is required.")
        if not last_name:
            raise BadRequestError(message="Last name is required.")
        if not email:
            raise BadRequestError(message="Email is required.")
        if not password:
            raise BadRequestError(message="Password is required.")
        
        EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

        if not EMAIL_REGEX.match(email):
            raise BadRequestError(message="Email address is not valid.")
        
        if len(password) < 8:
            raise BadRequestError(message="Password must be at least 8 characters long.")

        # Check if user with the same email already exists
        if User.query.filter_by(email=email).first():
            raise ConflictError(message="User has been already registered using this email address.")
        
        new_user = User(
            first_name= first_name,
            last_name = last_name,
            email = email,
        )
        new_user.password = password

        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return new_user.to_dict()
    

