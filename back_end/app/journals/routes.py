from flask import request
from flask_login import login_required, current_user
from . import journals_bp
from ..utils.response import make_response, make_error
from ..extentions import db
from ..models import JournalEntry, Emotion
from ..emotion_detect.emotion_model_run import analyze_emotions

@journals_bp.route('/', methods=['GET'])
@login_required
def get_journal_entries():

    request_path = request.url
    user_id = current_user.id

    journal_entries = JournalEntry.query.filter_by(user_id=user_id).all()
    if journal_entries:
        return make_response(
        status_code=200,
        data=[entry.to_dict() for entry in journal_entries],  
        message=f'Journal entries found successfully',
        path=request_path
    )
    else:
        return make_error(
            message=f'No journal entries found',
            status_code= 404,
            path= request_path
        )

@journals_bp.route('/<int:entry_id>', methods=['GET'])
@login_required
def get_journal_entry(entry_id):

    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    if journal_entry:
        return make_response(
        status_code=200,
        data=journal_entry.to_dict(),  
        message=f'Journal entry with id {entry_id} found successfully',
        path=request_path
    )
    else:
        return make_error(
            message=f'Journal entry with the id {entry_id} is not found.',
            status_code= 404,
            path= request_path
        )

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

@journals_bp.route('/<int:entry_id>', methods=['PUT'])
@login_required
def update_journal_entry(entry_id):

    data = request.get_json()
    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    if not journal_entry:
        return make_error(
            message=f'Journal entry with the id {entry_id} is not found.',
            status_code=404,
            path=request_path
        )

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

@journals_bp.route('/<int:entry_id>', methods=['DELETE'])
@login_required
def delete_journal_entry(entry_id):  

    request_path = request.url
    user_id = current_user.id

    journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

    if not journal_entry:
        return make_error(
            message=f'Journal entry with the id {entry_id} is not found.',
            status_code=404,
            path=request_path
        )

    db.session.delete(journal_entry)
    db.session.commit()

    return make_response(
        status_code=200,
        data={},
        message='Journal entry deleted successfully.',
        path=request_path
    )