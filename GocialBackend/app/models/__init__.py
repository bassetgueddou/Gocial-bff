"""
Database models for Gocial.

Import everything here so you can do:
    from app.models import User, Activity, etc.
"""

from app.models.base import CRUDMixin, PkModel, reference_col
from app.models.user import User, Role
from app.models.activity import Activity, Participation, ActivityLike
from app.models.social import Friendship, Message, Notification, Report

# What gets exported when you do "from app.models import *"
__all__ = [
    # Base
    'CRUDMixin',
    'PkModel',
    'reference_col',
    # User
    'User',
    'Role',
    # Activity
    'Activity',
    'Participation',
    'ActivityLike',
    # Social
    'Friendship',
    'Message',
    'Notification',
    'Report',
]
