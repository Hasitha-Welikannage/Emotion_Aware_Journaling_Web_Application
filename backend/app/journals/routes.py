from . import journals_bp
from flask import request
from .services import JournalService
from flask_login import login_required
from ..utils.response import make_response

# Get all journal entries for the current user
@journals_bp.route('/', methods=['GET'])
@login_required
def get_journal_entries():

    journal_entries = JournalService.get_journal_entries()

    return make_response(
        status_code=200,
        data=journal_entries,  
        message=f'Journal entries found successfully',
    )

# Get a specific journal entry by ID
@journals_bp.route('/<int:entry_id>', methods=['GET'])
@login_required
def get_journal_entry(entry_id):

    journal_entry = JournalService.get_journal_entry_by_id(entry_id)
        
    return make_response(
        status_code=200,
        data=journal_entry.to_dict(),  
        message=f'Journal entry found successfully',
    )

# Create a new journal entry
@journals_bp.route('/', methods=['POST'])
@login_required
def create_journal_entry():

    data = request.get_json()
    journal_entry = JournalService.create_journal_entry(data)

    return make_response(
        status_code=201,
        data=journal_entry,
        message='Journal entry created successfully.',
    )

# Update an existing journal entry
@journals_bp.route('/<int:entry_id>', methods=['PUT'])
@login_required
def update_journal_entry(entry_id):

    data = request.get_json()
    journal_entry = JournalService.update_journal_entry(entry_id, data)

    return make_response(
        status_code=200,
        data=journal_entry,
        message='Journal entry updated successfully.',
    )

# Delete a journal entry
@journals_bp.route('/<int:entry_id>', methods=['DELETE'])
@login_required
def delete_journal_entry(entry_id):  

    JournalService.delete_journal_entry(entry_id)

    return make_response(
        status_code=200,
        message='Journal entry deleted successfully.',
    )