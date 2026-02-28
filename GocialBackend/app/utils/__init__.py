"""
Utility functions

Helpers that get used across the app.
Random stuff that doesn't fit anywhere else.
"""

import re
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from app.models import User


# ---------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------

def is_valid_email(email):
    """
    Basic email validation.
    
    Not trying to be RFC 5322 compliant here, just catching obvious mistakes.
    """
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def is_valid_phone(phone):
    """
    Very loose phone validation - just checks it's numeric-ish.
    Different countries have different formats so we keep it simple.
    """
    if not phone:
        return True  # Phone is optional usually
    cleaned = re.sub(r'[\s\-\.\(\)\+]', '', phone)
    return len(cleaned) >= 8 and cleaned.isdigit()


def validate_password_strength(password):
    """
    Check password meets minimum requirements.
    
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password needs at least one uppercase letter'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password needs at least one lowercase letter'
    
    if not re.search(r'\d', password):
        return False, 'Password needs at least one number'
    
    return True, None


def is_valid_pseudo(pseudo):
    """
    Validate username/pseudo format.
    """
    if not pseudo or len(pseudo) < 3:
        return False, 'Pseudo must be at least 3 characters'
    
    if len(pseudo) > 30:
        return False, 'Pseudo is too long (max 30 chars)'
    
    if not re.match(r'^[a-zA-Z0-9_\.]+$', pseudo):
        return False, 'Pseudo can only contain letters, numbers, underscores and dots'
    
    return True, None


# ---------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------

def verified_required(f):
    """
    Decorator that requires the current user to be verified.
    
    Use on routes that need verified accounts (like creating activities).
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_verified:
            return jsonify({'error': 'Account verification required'}), 403
        
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """
    Decorator that requires admin privileges.
    
    For moderation and admin panel stuff.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # You'd add an is_admin field to User model for real
        if not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated


def rate_limit(max_requests, window_seconds=60):
    """
    Simple rate limiting decorator.
    
    In production you'd use something like Flask-Limiter with Redis.
    This is just a placeholder that always allows.
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # TODO: Implement actual rate limiting with Redis
            # For now just pass through
            return f(*args, **kwargs)
        return decorated
    return decorator


# ---------------------------------------------------------------------
# Formatters
# ---------------------------------------------------------------------

def format_datetime(dt, include_time=True):
    """
    Format datetime for API responses.
    """
    if not dt:
        return None
    
    if include_time:
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return dt.strftime('%Y-%m-%d')


def format_date_relative(dt):
    """
    Format datetime as relative string (e.g., "2 hours ago").
    
    For notification timestamps and stuff.
    """
    from datetime import datetime, timedelta
    
    if not dt:
        return None
    
    now = datetime.utcnow()
    diff = now - dt
    
    if diff < timedelta(minutes=1):
        return 'Just now'
    elif diff < timedelta(hours=1):
        mins = int(diff.total_seconds() / 60)
        return f'{mins} min ago'
    elif diff < timedelta(days=1):
        hours = int(diff.total_seconds() / 3600)
        return f'{hours}h ago'
    elif diff < timedelta(days=7):
        days = diff.days
        return f'{days}d ago'
    else:
        return dt.strftime('%b %d')


def sanitize_string(s, max_length=None):
    """
    Clean up user input string.
    """
    if not s:
        return None
    
    # Strip whitespace
    s = s.strip()
    
    # Remove null bytes and other control chars
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)
    
    # Truncate if needed
    if max_length and len(s) > max_length:
        s = s[:max_length]
    
    return s or None


# ---------------------------------------------------------------------
# Pagination helper
# ---------------------------------------------------------------------

def paginate_query(query, page=1, per_page=20, max_per_page=100):
    """
    Apply pagination to a SQLAlchemy query.
    
    Returns dict with items and pagination info.
    """
    per_page = min(per_page, max_per_page)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': pagination.items,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
    }


# ---------------------------------------------------------------------
# Request helpers
# ---------------------------------------------------------------------

def get_pagination_args():
    """
    Extract pagination args from request.
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Sanitize
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    
    return page, per_page


def get_bool_arg(name, default=False):
    """
    Get a boolean query parameter.
    """
    value = request.args.get(name, '').lower()
    if value in ('true', '1', 'yes', 'on'):
        return True
    elif value in ('false', '0', 'no', 'off'):
        return False
    return default
