"""
User profile routes

Profile viewing, editing, avatar uploads, user search.
Basically everything user-related that isn't auth.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os
from werkzeug.utils import secure_filename

from app import db
from app.models import User, Activity, Friendship

users_bp = Blueprint('users', __name__)


def allowed_file(filename):
    """Check if file extension is allowed for uploads."""
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


# ---------------------------------------------------------------------
# Get user profile
# ---------------------------------------------------------------------

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get a user's public profile.
    
    If viewing your own profile, includes private info too.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user is deactivated (unless it's yourself)
    if not user.is_active and user_id != current_user_id:
        return jsonify({'error': 'User not found'}), 404
    
    # Own profile gets full access
    is_own_profile = user_id == current_user_id
    
    response = {
        'user': user.to_dict(
            include_private=is_own_profile,
            include_settings=is_own_profile
        )
    }
    
    # Add friendship status if viewing someone else
    if not is_own_profile:
        friendship = Friendship.query.filter(
            ((Friendship.user_id == current_user_id) & (Friendship.friend_id == user_id)) |
            ((Friendship.user_id == user_id) & (Friendship.friend_id == current_user_id))
        ).first()
        
        if friendship:
            response['friendship_status'] = friendship.status
            response['friendship_id'] = friendship.id
        else:
            response['friendship_status'] = None
    
    return jsonify(response), 200


# ---------------------------------------------------------------------
# Update profile
# ---------------------------------------------------------------------

@users_bp.route('/profile', methods=['PUT', 'PATCH'])
@jwt_required()
def update_profile():
    """
    Update your own profile.
    
    Only updates fields that are provided in the request.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Fields that can be updated
    allowed_fields = [
        'first_name', 'last_name', 'pseudo', 'phone', 'gender',
        'city', 'address', 'postal_code', 'bio',
        'company_name', 'description', 'website',
        'instagram', 'facebook', 'tiktok', 'snapchat',
    ]
    
    # Settings fields
    settings_fields = [
        'dark_mode', 'is_ghost_mode', 'girls_only_mode', 'language',
        'notif_new_activity', 'notif_friend_request', 
        'notif_messages', 'notif_participation', 'notif_push_enabled',
    ]
    
    # Update regular fields
    for field in allowed_fields:
        if field in data:
            value = data[field]
            if isinstance(value, str):
                value = value.strip() or None
            setattr(user, field, value)
    
    # Update settings
    for field in settings_fields:
        if field in data:
            setattr(user, field, bool(data[field]))
    
    # Handle pseudo change - check uniqueness
    if 'pseudo' in data and data['pseudo']:
        new_pseudo = data['pseudo'].strip()
        if new_pseudo != user.pseudo:
            existing = User.query.filter_by(pseudo=new_pseudo).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'This pseudo is already taken'}), 409
            user.pseudo = new_pseudo
    
    # Handle location update
    if 'latitude' in data and 'longitude' in data:
        user.latitude = data['latitude']
        user.longitude = data['longitude']
    
    # Handle FCM token for push notifications
    if 'fcm_token' in data:
        user.fcm_token = data['fcm_token']
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Profile update failed: {e}')
        return jsonify({'error': 'Update failed'}), 500
    
    return jsonify({
        'message': 'Profile updated',
        'user': user.to_dict(include_private=True, include_settings=True)
    }), 200


# ---------------------------------------------------------------------
# Avatar upload
# ---------------------------------------------------------------------

@users_bp.route('/profile/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """
    Upload a new profile picture.
    
    Accepts multipart/form-data with 'file' field.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Generate safe filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f'avatar_{user_id}_{int(datetime.utcnow().timestamp())}.{ext}'
    filename = secure_filename(filename)
    
    # Get upload folder
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    avatar_folder = os.path.join(upload_folder, 'avatars')
    
    # Create folder if it doesn't exist
    os.makedirs(avatar_folder, exist_ok=True)
    
    # Save file
    filepath = os.path.join(avatar_folder, filename)
    file.save(filepath)
    
    # Update user avatar URL
    # In production, this would be a CDN URL
    user.avatar_url = f'/uploads/avatars/{filename}'
    db.session.commit()
    
    return jsonify({
        'message': 'Avatar uploaded',
        'avatar_url': user.avatar_url
    }), 200


# ---------------------------------------------------------------------
# Search users (discoveries)
# ---------------------------------------------------------------------

@users_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    """
    Search for users to discover.
    
    Query params:
    - q: search term (name, pseudo)
    - type: user type filter (person, pro, asso)
    - city: city filter
    - page, per_page: pagination
    """
    current_user_id = get_jwt_identity()
    
    query_text = request.args.get('q', '').strip()
    user_type = request.args.get('type')
    city = request.args.get('city', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)  # Cap at 50
    
    # Base query - exclude self and inactive users
    query = User.query.filter(
        User.id != current_user_id,
        User.is_active == True
    )
    
    # Exclude ghost mode users (they don't want to be found)
    query = query.filter(User.is_ghost_mode == False)
    
    # Search by text
    if query_text:
        search_pattern = f'%{query_text}%'
        query = query.filter(
            (User.pseudo.ilike(search_pattern)) |
            (User.first_name.ilike(search_pattern)) |
            (User.company_name.ilike(search_pattern))
        )
    
    # Filter by type
    if user_type in ('person', 'pro', 'asso'):
        query = query.filter(User.user_type == user_type)
    
    # Filter by city
    if city:
        query = query.filter(User.city.ilike(f'%{city}%'))
    
    # Order by verified first, then recent activity
    query = query.order_by(
        User.is_verified.desc(),
        User.last_seen.desc()
    )
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
    }), 200


# ---------------------------------------------------------------------
# Get user's activities
# ---------------------------------------------------------------------

@users_bp.route('/<int:user_id>/activities', methods=['GET'])
@jwt_required()
def get_user_activities(user_id):
    """
    Get activities hosted by a specific user.
    """
    current_user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    include_past = request.args.get('include_past', 'false').lower() == 'true'
    
    query = Activity.query.filter(
        Activity.host_id == user_id,
        Activity.status == 'published'
    )
    
    # By default, only show upcoming activities
    if not include_past:
        query = query.filter(Activity.date >= datetime.utcnow())
    
    # Only show public activities (unless viewing own)
    if user_id != current_user_id:
        query = query.filter(Activity.visibility == 'public')
    
    query = query.order_by(Activity.date.asc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'activities': [a.to_dict(viewer_id=current_user_id) for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
    }), 200


# ---------------------------------------------------------------------
# Deactivate account
# ---------------------------------------------------------------------

@users_bp.route('/deactivate', methods=['POST'])
@jwt_required()
def deactivate_account():
    """
    Soft-delete account. Can be reactivated later.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Require password confirmation for safety
    password = data.get('password', '')
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401
    
    user.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Account deactivated'}), 200


# ---------------------------------------------------------------------
# Delete account (permanent)
# ---------------------------------------------------------------------

@users_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    """
    Permanently delete account and all associated data.
    
    This is irreversible - we require password confirmation.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    password = data.get('password', '')
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401
    
    # Confirmation phrase for extra safety
    confirmation = data.get('confirmation', '')
    if confirmation != 'DELETE MY ACCOUNT':
        return jsonify({'error': 'Please confirm with "DELETE MY ACCOUNT"'}), 400
    
    try:
        # This will cascade delete participations, etc.
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Account deletion failed: {e}')
        return jsonify({'error': 'Deletion failed'}), 500
    
    return jsonify({'message': 'Account permanently deleted'}), 200
