from flask import jsonify
from datetime import datetime, timezone

def make_response(message=None, data=None, status_code=200, path=None):
    response = {
        'success': True,
        'message': message,
        'data': data,
        'status_code': status_code,
        'path': path,
        'time_stamp': datetime.now(timezone.utc)
    }
    
    return jsonify(response), status_code

def make_error(message='An error occurred', status_code=400, details=None, path=None):
    response = {
        'success': False,
        'message': message,
        'status_code': status_code,
        'path': path,
        'time_stamp': datetime.now(timezone.utc)
    }

    if details:
        response['details'] = details

    return jsonify(response), status_code