class AppError(Exception):
    status_code = 400
    message = 'An application error occurred.'

    def __init__(self, message=None, status_code=None, details=None, path=None):
        super().__init__()
        if message:
            self.message = message
        if status_code:
            self.status_code = status_code
        self.details = details
        self.path = path

    def to_dict(self):
        error_dict = {
            'message': self.message,
            'status_code': self.status_code,
            'path': self.path
        }
        if self.details:
            error_dict['details'] = self.details
        return error_dict

class BadRequestError(AppError):
    status_code = 400
    message = 'Bad request.'

class UnauthorizedError(AppError):
    status_code = 401
    message = 'Authentication is required to access this resource.'

class ForbiddenError(AppError):
    status_code = 403
    message = 'Forbidden access.'

class NotFoundError(AppError):
    status_code = 404
    message = 'Resource not found.' 

class MethodNotAllowedError(AppError):
    status_code = 405
    message = 'Method not allowed.'

class ConflictError(AppError):
    status_code = 409
    message = 'Conflict occurred.'





