from flask import request
from flask_login import login_required, current_user
from . import journals_bp
from ..utils.response import make_response, make_error
from ..extentions import db
from ..models import JournalEntry, Emotion
from ..emotion_detect.emotion_model_run import analyze_emotions
from ..utils.custom_exceptions import NotFoundError

# Get all journal entries for the current user
@journals_bp.route('/', methods=['GET'])
@login_required
def get_journal_entries():

    request_path = request.url
    user_id = current_user.id

    journal_entries = JournalEntry.query.filter_by(user_id=user_id).all()

    # Check if any journal entries exist for the user
    if not journal_entries:
        raise NotFoundError(f'No journal entries found for user with id {user_id}')

    return make_response(
        status_code=200,
        data=[entry.to_dict() for entry in journal_entries],  
        message=f'Journal entries found successfully',
        path=request_path
    )

# Get a specific journal entry by ID
@journals_bp.route('/<int:entry_id>', methods=['GET'])
@login_required
def get_journal_entry(entry_id):

    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    # Check if the journal entry exists
    if not journal_entry:
        raise NotFoundError(f'Journal entry with id {entry_id} not found.')
        
    return make_response(
        status_code=200,
        data=journal_entry.to_dict(),  
        message=f'Journal entry with id {entry_id} found successfully',
        path=request_path
    )

# Create a new journal entry
@journals_bp.route('/', methods=['POST'])
@login_required
def create_journal_entry():

    data = request.get_json()
    request_path = request.url
    user_id = current_user.id

    title = data.get('title')
    content = data.get('content')

    if not content:
        return make_error(
            message='Content is required to create a journal entry.',
            status_code=400,
            path=request_path
        )

    new_entry = JournalEntry(
        user_id=user_id,
        title=title,
        content=content
    )

    emotions = analyze_emotions(content)
    for emotion_name, confidence_score in emotions.items():
        emotion = Emotion(
            entry_id=new_entry.id,
            emotion_name=emotion_name,
            confidence_score=confidence_score
        )
        new_entry.emotions.append(emotion)

    db.session.add(new_entry)
    db.session.commit()

    return make_response(
        status_code=201,
        data=new_entry.to_dict(),
        message='Journal entry created successfully.',
        path=request_path
    )

# Update an existing journal entry
@journals_bp.route('/<int:entry_id>', methods=['PUT'])
@login_required
def update_journal_entry(entry_id):

    data = request.get_json()
    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    if not journal_entry:
        raise NotFoundError(f'Journal entry with id {entry_id} not found.')

    title = data.get('title')
    content = data.get('content')

    if title is not None:
        journal_entry.title = title
    if content is not None:
        journal_entry.content = content

        # Re-analyze emotions if content is updated
        journal_entry.emotions.clear()
        emotions = analyze_emotions(content)
        for emotion_name, confidence_score in emotions.items():
            emotion = Emotion(
                entry_id=journal_entry.id,
                emotion_name=emotion_name,
                confidence_score=confidence_score
            )
            journal_entry.emotions.append(emotion)

    db.session.commit()

    return make_response(
        status_code=200,
        data=journal_entry.to_dict(),
        message='Journal entry updated successfully.',
        path=request_path
    )

# Delete a journal entry
@journals_bp.route('/<int:entry_id>', methods=['DELETE'])
@login_required
def delete_journal_entry(entry_id):  

    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    if not journal_entry:
        raise NotFoundError(f'Journal entry with id {entry_id} not found.')

    db.session.delete(journal_entry)
    db.session.commit()

    return make_response(
        status_code=200,
        message='Journal entry deleted successfully.',
        path=request_path
    )