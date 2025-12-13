from ..extentions import db
from ..models import User
from ..utils.custom_exceptions import NotFoundError, UnauthorizedError, BadRequestError

class UserService:

    @staticmethod
    def get_user_by_id(user_id):

        user = User.query.get(user_id)

        # Check if user exists
        if not user:
            raise NotFoundError(f'User with the id {user_id} is not found.')
        
        return user.to_dict()
