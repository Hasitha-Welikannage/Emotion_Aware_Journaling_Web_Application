from ..extentions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=False)
    detected_emotions = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('journal_entries', lazy='dynamic'))