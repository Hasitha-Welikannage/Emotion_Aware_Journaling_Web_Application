from flask import request
from flask_login import login_required, current_user
from . import user_bp
from ..extentions import db
from ..utils.response import make_response, make_error
from ..models import User

@user_bp.route('/', methods=['GET'])
@login_required
def get_all_users():

    request_path = request.url

    users = User.query.all()

    if users:
        return make_response(
        status_code=200,
        data=[user.to_dict() for user in users],  
        message=f'Users are found sucessfully',
        path=request_path
    )
    else:
        return make_error(
            message=f'Can not find any users',
            status_code= 404,
            path= request_path
        )    

@user_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):

    request_path = request.url

    user = User.query.get(user_id)

    if user:
        return make_response(
        status_code=200,
        data=user.to_dict(),  
        message=f'User with id {user_id} found sucessfully',
        path=request_path
    )
    else:
        return make_error(
            message=f'User with the id {user_id} is not found.',
            status_code= 404,
            path= request_path
        )

@user_bp.route('/<int:user_id>',methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.get_json()
    request_path = request.url

    user = User.query.get(user_id)

    if user:

        user.set_first_name(data.get('first_name'))
        user.set_last_name(data.get('last_name'))
        user.set_password(data.get('password'))

        db.session.commit()

        return make_response(
            status_code=200,
            data=user.to_dict(),  
            message='User updated sucessfully',
            path=request_path
        )    
    else:
        return make_error(
            message=f'User with the id {user_id} is not found.',
            status_code= 404,
            path= request_path
        )

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):

    request_path = request.url

    user = User.query.get(user_id)

    if user:

        db.session.delete(user)
        db.session.commit()

        return make_response(
            status_code=200, 
            message=f'User with ID {user_id} deleted successfully.',
            path=request_path
        )
    else:

        return make_error(
            message=f'User with the id {user_id} is not found.',
            status_code= 404,
            path= request_path
        )