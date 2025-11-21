from flask import request,session
from flask_login import login_user, logout_user, login_required, current_user
from . import auth_bp
from ..extentions import db
from ..utils.response import make_response, make_error
from ..models import User
from ..utils.custom_exceptions import ConflictError, NotFoundError, UnauthorizedError

# User Registration Route
@auth_bp.route('/register', methods=['POST'])
def user_register():
    data = request.get_json()
    request_path = request.url

    # Check if user with the same email already exists
    if User.query.filter_by(email=data.get('email')).first():
        raise ConflictError(message="User has been already registered using this email address.", path=request_path)
    
    new_user = User(
        first_name= data.get('first_name'),
        last_name = data.get('last_name'),
        email = data.get('email')
    )
    new_user.set_password(data.get('password'))

    db.session.add(new_user)
    db.session.commit()

    return make_response(
        status_code=201,
        data=new_user.to_dict(),  
        message='User registered successfully.',
        path=request_path
    )

# User Login Route
@auth_bp.route('/login', methods=['POST'])
def user_login():
    
    data = request.get_json()
    request_path = request.url

    user = User.query.filter_by(email=data.get('email')).first()

    # Check if user exists
    if not user:
        raise NotFoundError(message=f'There is no user under {data.get("email")} email.', path=request_path)    

    # Check if password is correct
    if not user.check_password(data.get('password')):
        raise UnauthorizedError(message='Password is incorrect.', path=request_path)
    
    login_user(user, remember=True)
    return make_response(
        message='User login sucessfully.',
        data=user.to_dict(),
        status_code=200,
        path=request_path
    )

# User Logout Route    
@auth_bp.route("/logout", methods=["POST"])
@login_required
def user_logout():

    request_path = request.url

    # Check if user is authenticated
    if not current_user.is_authenticated:
        raise UnauthorizedError(message='No user is currently logged in.', path=request_path)

    logout_user()
    return make_response(
        message='User logout sucessfully.',
        status_code=200,
        path=request_path
    )