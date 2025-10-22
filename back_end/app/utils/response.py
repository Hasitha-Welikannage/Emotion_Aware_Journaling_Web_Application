from flask import jsonify
from datetime import datetime

def make_response(success=True, message=None, data=None, status_code=200, path=None):
    response = {
        'success': success,
        'message': message,
        'data': data,
        'status_code': status_code,
        'path': path,
        'time_stamp': datetime.now()
    }
    
    return jsonify(response), status_code

def make_error(message='An error occurred', status_code=400, details=None):
    response = {
        'success': False,
        'message': message
    }

    if details:
        response['details'] = details

    return jsonify(response), status_code