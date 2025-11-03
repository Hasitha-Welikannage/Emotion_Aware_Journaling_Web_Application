from flask import request,session
from flask_login import login_user, logout_user, login_required, current_user
from . import auth_bp
from ..extentions import db
from ..utils.response import make_response, make_error
from ..users.models import User

@auth_bp.route('/register', methods=['POST'])
def user_register():
    data = request.get_json()
    request_path = request.url

    if User.query.filter_by(email=data.get('email')).first():
        return make_error(
            message="User has been already registered using this email address.",
            path= request_path
        )
    
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
        data=new_user.to_dict,  
        message='User registered sucessfully.',
        path=request_path
    )

@auth_bp.route('/login', methods=['POST'])
def user_login():
    
    data = request.get_json()
    request_path = request.url

    user = User.query.filter_by(email=data.get('email')).first()

    if user:
        if user.check_password(data.get('password')):
            login_user(user, remember=True)
            return make_response(
                message='User login sucessfully.',
                data=user.to_dict(),
                status_code=200,
                path=request_path
            )
        else:
            return make_error(
                message='Entered password is incorrect.',
                status_code=401,
                path=request_path
            )
    else:
        
        return make_error(
            message=f'There is no user under {data.get('email')} email.',
            status_code=404,
            path=request_path
        )
    
@auth_bp.route("/logout", methods=["POST"])
@login_required
def user_logout():

    request_path = request.url

    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return make_response(
            message='User logout sucessfully.',
            status_code=200,
            path=request_path
        )
    else:
        return make_error(
            message=f'There is no user logedin.',
            status_code=404,
            path=request_path
        )