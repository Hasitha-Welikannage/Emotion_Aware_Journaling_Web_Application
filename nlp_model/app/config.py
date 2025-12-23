# import os
# from dotenv import load_dotenv
# from datetime import timedelta

# load_dotenv()

# class Config():
#     SECRET_KEY = os.getenv("SECRET_KEY")
#     SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     SESSION_COOKIE_SECURE = False
#     PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
#     SESSION_COOKIE_HTTPONLY = True
#     SESSION_PERMANENT = True
#     SESSION_COOKIE_SAMESITE = "Lax"
#     REMEMBER_COOKIE_SECURE = False
#     REMEMBER_COOKIE_SAMESITE = "Lax"