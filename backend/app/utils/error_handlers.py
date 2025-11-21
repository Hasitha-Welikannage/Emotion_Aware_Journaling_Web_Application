from flask import request
from .response import make_error
from .custom_exceptions import AppError
import logging

def registor_error_handlers(app, login_manager):

    @app.errorhandler(AppError)
    def handle_app_error(error):
        return make_error(
            message=error.message,
            status_code=error.status_code,
            details=error.details,
            path=error.path
        )

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        logging.exception(f"An unexpected error occurred: {str(error)}")
        return make_error(
            message='Internal Server Error',
            status_code=500,
            details=str(error),
            path=request.path
        )

    @login_manager.unauthorized_handler
    def handle_unauthorized():
        return make_error(
            message='Unauthorized Access',
            status_code=401,
            details='Authentication is required to access this resource.',
            path=request.path
        )
    
