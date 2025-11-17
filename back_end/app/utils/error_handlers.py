from flask import request
from .response import make_error
from .custom_exceptions import AppError
import logging

def registor_error_handlers(app):

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