from flask import request
from flask_login import login_user, logout_user, login_required, current_user
from . import auth_bp
from ..extentions import db
from ..utils.response import make_response, make_error
from ..users.models import User

@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    request_path = request.url

    if User.query.filter_by(email=data.get('email')).first():
        return make_error(
            message="User has been already registered using this email address",
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
        message='User registered sucessfully',
        path=request_path
    )
