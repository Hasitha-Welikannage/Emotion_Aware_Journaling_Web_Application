from . import auth_bp
from flask import request
from .services import AuthService
from flask_login import login_required
from ..utils.response import make_response

# Get Current User
@auth_bp.route('/current_user', methods=['GET'])
@login_required
def get_current_user():
    user = AuthService.get_current_user()
    return make_response(
        message='Current user retrieved successfully.',
        data=user,
        status_code=200,
    )

# User Login Route
@auth_bp.route('/login', methods=['POST'])
def user_login():
    data = request.get_json()
    user = AuthService.user_login(data)
    return make_response(
        message='User login sucessfully.',
        data=user,
        status_code=200,
    )

# User Logout Route    
@auth_bp.route("/logout", methods=["POST"])
@login_required
def user_logout():
    AuthService.user_logout()
    return make_response(
        message='User logout sucessfully.',
        status_code=200,
    )

# User Registration Route
@auth_bp.route('/register', methods=['POST'])
def user_register():
    data = request.get_json()
    new_user = AuthService.user_register(data)
    return make_response(
        status_code=201,
        data=new_user,  
        message='User registered successfully.',
    )