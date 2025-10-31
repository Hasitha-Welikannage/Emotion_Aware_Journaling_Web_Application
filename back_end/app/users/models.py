from ..extentions import db, bcrypt
from flask_login import UserMixin

class User(db.Model,UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(256), nullable=False)
    password = db.Column(db.String, nullable=False)

    def get_first_name(self):
        return self.first_name
    
    def set_first_name(self, first_name):
        self.first_name = first_name

    def get_last_name(self):
        return self.last_name
    
    def set_last_name(self, last_name):
        self.last_name = last_name

    def get_email(self):
        return self.email

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }