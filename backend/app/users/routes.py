from flask import request
from flask_login import login_required, current_user
from . import user_bp
from ..extentions import db
from ..utils.response import make_response, make_error
from ..models import User
from ..utils.custom_exceptions import NotFoundError, UnauthorizedError, BadRequestError

# Get all users
@user_bp.route('/', methods=['GET'])
@login_required
def get_all_users():

    request_path = request.url

    users = User.query.all()

    if not users:
        raise NotFoundError('No users found.')
    
    return make_response(
        status_code=200,
        data=[user.to_dict() for user in users],  
        message=f'Users are found sucessfully',
        path=request_path
    )   

# Get a specific user by ID
@user_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):

    request_path = request.url

    user = User.query.get(user_id)

    # Check if user exists
    if not user:
        raise NotFoundError(f'User with the id {user_id} is not found.')
    
    return make_response(
        status_code=200,
        data=user.to_dict(),  
        message=f'User with id {user_id} found sucessfully',
        path=request_path
    )

# Update a specific user by ID
@user_bp.route('/<int:user_id>',methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.get_json()
    request_path = request.url

    if not data.get('first_name'):
        raise BadRequestError(message="First name is required.", path=request_path)
    if not data.get('last_name'):
        raise BadRequestError(message="Last name is required.", path=request_path)

    user = User.query.get(user_id)

    # Check if user exists
    if not user:
        raise NotFoundError(f'User with the id {user_id} is not found.')
    
    if data.get('new_password'):
        if not data.get('current_password'):
            raise BadRequestError(message="Current password is required.", path=request_path)
        if not data.get('new_password'):
            raise BadRequestError(message="New password is required.", path=request_path)
        # Verify current password
        if not user.check_password(data.get('current_password')):
            raise BadRequestError('Current password is incorrect.')
        user.set_password(data.get('new_password', user.password))

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    db.session.commit()

    return make_response(
        status_code=200,
        data=user.to_dict(),  
        message='User updated sucessfully',
        path=request_path
    )    

# Delete a specific user by ID
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):

    request_path = request.url

    user = User.query.get(user_id)

    # Check if user exists
    if not user:
        raise NotFoundError(f'User with the id {user_id} is not found.')

    db.session.delete(user)
    db.session.commit()

    return make_response(
        status_code=200, 
        message=f'User with ID {user_id} deleted successfully.',
        path=request_path
    )