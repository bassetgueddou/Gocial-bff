"""
Configuration settings for Gocial API

Different configs for different environments. Don't hardcode secrets here,
use .env file instead. If you're reading this in prod and there's a 
'dev-secret-key' somewhere, we need to talk.
"""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Load env vars from .env file if it exists
basedir = Path(__file__).parent
load_dotenv(basedir / '.env')


def get_env(key, default=None, cast=str):
    """Helper to grab env vars with type casting."""
    value = os.getenv(key, default)
    if value is None:
        return None
    try:
        return cast(value)
    except (ValueError, TypeError):
        return default


class Config:
    """
    Base config - shared settings across all environments.
    Override these in subclasses when needed.
    """
    
    # Security - CHANGE THESE IN PRODUCTION!
    SECRET_KEY = get_env('SECRET_KEY', 'change-me-in-prod-please')
    
    # Database
    SQLALCHEMY_DATABASE_URI = get_env('DATABASE_URL', f'sqlite:///{basedir}/gocial.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Saves memory, we don't need this
    SQLALCHEMY_ECHO = False
    
    # JWT tokens
    JWT_SECRET_KEY = get_env('JWT_SECRET_KEY', 'jwt-secret-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=get_env('JWT_ACCESS_HOURS', 24, int))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # CORS - mobile app URLs
    CORS_ORIGINS = get_env('CORS_ORIGINS', 'http://localhost:8081')
    
    # File uploads
    MAX_CONTENT_LENGTH = get_env('MAX_UPLOAD_MB', 16, int) * 1024 * 1024
    UPLOAD_FOLDER = get_env('UPLOAD_FOLDER', str(basedir / 'uploads'))
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Email (for password reset, notifications, etc.)
    MAIL_SERVER = get_env('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = get_env('MAIL_PORT', 587, int)
    MAIL_USE_TLS = True
    MAIL_USERNAME = get_env('MAIL_USERNAME')
    MAIL_PASSWORD = get_env('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = get_env('MAIL_SENDER', 'noreply@gocial.app')
    
    # Rate limiting (implement later with Flask-Limiter)
    RATELIMIT_ENABLED = True
    RATELIMIT_DEFAULT = "100/hour"
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100


class DevelopmentConfig(Config):
    """Dev environment - debug mode ON, verbose SQL logging."""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Print SQL queries to console
    
    # More lenient rate limits for dev
    RATELIMIT_ENABLED = False


class ProductionConfig(Config):
    """
    Production settings - lock it down.
    Make sure all secrets come from env vars!
    """
    DEBUG = False
    
    # Force HTTPS in prod
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Tighter token expiry
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class TestingConfig(Config):
    """Test environment - in-memory DB, testing flag ON."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Skip rate limits in tests
    RATELIMIT_ENABLED = False
    
    # Shorter tokens for faster tests
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


# Config registry - pick one based on FLASK_ENV
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
