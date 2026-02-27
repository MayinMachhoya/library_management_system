import os
from datetime import timedelta

class Config:
    # Use environment variables; enforce PostgreSQL Connection
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-for-development")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("No DATABASE_URL found. You must set a PostgreSQL URI in the .env file.")
        
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_DELTA = timedelta(days=1)
