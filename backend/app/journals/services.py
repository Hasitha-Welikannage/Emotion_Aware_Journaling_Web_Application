from ..extentions import db
from flask_login import current_user
from ..models import JournalEntry, Emotion
from ..emotion_analysis.services import EmotionAnalysisService
from ..utils.custom_exceptions import NotFoundError, BadRequestError

class JournalService():

    @staticmethod
    def get_journal_entries():

        user_id = current_user.id
        journal_entries = JournalEntry.query.filter_by(user_id=user_id).all()

        return [entry.to_dict() for entry in journal_entries]
    
    @staticmethod
    def get_journal_entry_by_id(entry_id):
        
        user_id = current_user.id
        journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

        # Check if the journal entry exists
        if not journal_entry:
            raise NotFoundError(f'Journal entry not found.')
        
        return journal_entry.to_dict()
    
    @staticmethod
    def create_journal_entry(data):
        
        user_id = current_user.id

        if not data:
            raise BadRequestError("JSON body is required.")
        if not 'title' in data or not data.get('title'):
            raise BadRequestError(message="Title is required.")
        if not 'content' in data or not data.get('content'):
            raise BadRequestError(message="content is required.")

        title = data.get('title').strip()
        content = data.get('content').strip()

        new_entry = JournalEntry(
            user_id=user_id,
            title=title,
            content=content
        )

        emotions = EmotionAnalysisService.emotion_detection(content)

        for emotion_name, score in emotions.items():
            emotion = Emotion(
                entry_id=new_entry.id,
                emotion_name=emotion_name,
                confidence_score=score
            )
            new_entry.emotions.append(emotion)

        try:
            db.session.add(new_entry)
            db.session.commit() 
        except Exception:
            db.session.rollback()
            raise

        return new_entry.to_dict()

    @staticmethod
    def update_journal_entry(entry_id, data):

        title = None
        content = None
        user_id = current_user.id

        journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not journal_entry:
            raise NotFoundError(f'Journal entry not found.')
        
        if not data:
            raise BadRequestError("JSON body is required.")
        if 'title' in data:
            if not data.get('title'):
                raise BadRequestError(message="Title is required.")
            title = data.get('title').strip()
            if title != journal_entry.title:
                journal_entry.title = title

        if 'content' in data:
            if not data.get('content'):
                raise BadRequestError(message="content is required.")
            content = data.get('content').strip()
            if content != journal_entry.content:
                journal_entry.content = content
                
                # Re-analyze emotions if content is updated
                journal_entry.emotions.clear()
                emotions = EmotionAnalysisService.emotion_detection(content)
                for emotion_name, score in emotions.items():
                    emotion = Emotion(
                        entry_id=journal_entry.id,
                        emotion_name=emotion_name,
                        confidence_score=score
                    )
                    journal_entry.emotions.append(emotion)
        try:
            db.session.commit()  
        except Exception:
            db.session.rollback()
            raise

        return journal_entry.to_dict()

    @staticmethod
    def delete_journal_entry(entry_id):  

        user_id = current_user.id
        journal_entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()

        if not journal_entry:
            raise NotFoundError(f'Journal entry not found.')
        
        try:
            db.session.delete(journal_entry)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
     

