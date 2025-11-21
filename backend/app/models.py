from .extentions import db, bcrypt
from flask_login import UserMixin
from datetime import datetime, timezone

class User(db.Model,UserMixin):

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }
    
class JournalEntry(db.Model):

    __tablename__ = 'journal_entries'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=True, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('journal_entries', lazy='dynamic', cascade="all, delete-orphan"))
    emotions = db.relationship('Emotion', backref='journal_entry', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<JournalEntry {self.id} - {self.title}>'
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "emotions": [e.to_dict() for e in self.emotions]
        }

class Emotion(db.Model):

    __tablename__ = 'emotion'
    
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey('journal_entries.id'), nullable=False)
    emotion_name = db.Column(db.String(150), nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Emotion {self.emotion_name} ({self.confidence_score}%)>'

    def to_dict(self):
        return {
            "name": self.emotion_name,
            "confidence": self.confidence_score
        }