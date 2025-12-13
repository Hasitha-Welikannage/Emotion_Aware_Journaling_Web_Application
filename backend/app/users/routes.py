from . import user_bp
from flask import request
from .services import UserService
from flask_login import login_required
from ..utils.response import make_response

# Get current user profile
@user_bp.route('/', methods=['GET'])
@login_required
def get_user():
    user = UserService.get_user()
    return make_response(
        status_code=200,
        data=user,  
        message=f'User found sucessfully',
    )

# Update current user
@user_bp.route('/update',methods=['PUT'])
@login_required
def update_user():
    data = request.get_json()
    user = UserService.update_user(data)
    return make_response(
        status_code=200,
        data=user,  
        message=f'User updated sucessfully',
    )    

# Delete current user
@user_bp.route('/delete', methods=['DELETE'])
@login_required
def delete_user():
    UserService.delete_user()
    return make_response(
        status_code=200, 
        message=f'User deleted successfully.',
    )