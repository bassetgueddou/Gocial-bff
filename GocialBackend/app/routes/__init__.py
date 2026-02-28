"""
Route modules for Gocial API.

Each blueprint handles a different part of the API.
"""

from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.activities import activities_bp
from app.routes.friends import friends_bp
from app.routes.messages import messages_bp
from app.routes.notifications import notifications_bp

__all__ = [
    'auth_bp',
    'users_bp', 
    'activities_bp',
    'friends_bp',
    'messages_bp',
    'notifications_bp',
]
