"""
Notification routes

Push notifications, read status, listing.
Keeps users informed about what's happening.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.models import Notification, User

notifications_bp = Blueprint('notifications', __name__)


# ---------------------------------------------------------------------
# Get notifications
# ---------------------------------------------------------------------

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Get all notifications for the current user.
    
    Query params:
    - unread_only: only show unread notifications
    - page, per_page: pagination
    """
    user_id = get_jwt_identity()
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 30, type=int), 100)
    
    query = Notification.query.filter_by(user_id=user_id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    query = query.order_by(Notification.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    notifs = []
    for n in pagination.items:
        notifs.append(n.to_dict())
    
    return jsonify({
        'notifications': notifs,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_next': pagination.has_next,
    }), 200


# ---------------------------------------------------------------------
# Mark notification as read
# ---------------------------------------------------------------------

@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(notif_id):
    """
    Mark a single notification as read.
    """
    user_id = get_jwt_identity()
    
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
    
    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Marked as read'}), 200


# ---------------------------------------------------------------------
# Mark all as read
# ---------------------------------------------------------------------

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    """
    Mark all notifications as read.
    """
    user_id = get_jwt_identity()
    
    updated = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).update({
        'is_read': True,
        'read_at': datetime.utcnow()
    })
    
    db.session.commit()
    
    return jsonify({
        'message': 'All marked as read',
        'count': updated
    }), 200


# ---------------------------------------------------------------------
# Delete notification
# ---------------------------------------------------------------------

@notifications_bp.route('/<int:notif_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notif_id):
    """
    Delete a notification.
    """
    user_id = get_jwt_identity()
    
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
    
    db.session.delete(notif)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted'}), 200


# ---------------------------------------------------------------------
# Clear all notifications
# ---------------------------------------------------------------------

@notifications_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_all_notifications():
    """
    Delete all notifications.
    """
    user_id = get_jwt_identity()
    
    deleted = Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({
        'message': 'All notifications cleared',
        'count': deleted
    }), 200


# ---------------------------------------------------------------------
# Get unread count
# ---------------------------------------------------------------------

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    Get the number of unread notifications.
    
    Useful for badges and indicators.
    """
    user_id = get_jwt_identity()
    
    count = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).count()
    
    return jsonify({'unread': count}), 200


# ---------------------------------------------------------------------
# Internal: Create notification (not an API endpoint)
# ---------------------------------------------------------------------

def create_notification(user_id, notif_type, title, body=None, actor_id=None, data=None):
    """
    Helper to create and store a notification.
    
    Call this from other routes when something happens.
    
    Types:
    - friend_request: someone sent you a friend request
    - friend_accepted: your friend request was accepted
    - new_message: new message received
    - participation_request: someone wants to join your activity
    - participation_accepted: your participation was accepted
    - participation_rejected: your participation was rejected
    - activity_reminder: upcoming activity reminder
    - activity_cancelled: activity you joined was cancelled
    - new_activity: friend created a new activity
    """
    # Check user's notification settings first
    user = User.query.get(user_id)
    if not user:
        return None
    
    # Map notification type to user settings
    settings_map = {
        'friend_request': user.notif_friend_request,
        'friend_accepted': user.notif_friend_request,
        'new_message': user.notif_messages,
        'participation_request': user.notif_participation,
        'participation_accepted': user.notif_participation,
        'participation_rejected': user.notif_participation,
        'activity_reminder': user.notif_new_activity,
        'activity_cancelled': user.notif_new_activity,
        'new_activity': user.notif_new_activity,
    }
    
    # If user disabled this type, don't create
    if not settings_map.get(notif_type, True):
        return None
    
    notification = Notification(
        user_id=user_id,
        notif_type=notif_type,
        title=title,
        body=body,
        actor_id=actor_id,
        data=data or {},
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # TODO: Send push notification via FCM if user has push enabled and fcm_token
    # if user.notif_push_enabled and user.fcm_token:
    #     send_push_notification(user.fcm_token, title, body, data)
    
    return notification


# ---------------------------------------------------------------------
# Update FCM token
# ---------------------------------------------------------------------

@notifications_bp.route('/fcm-token', methods=['PUT'])
@jwt_required()
def update_fcm_token():
    """
    Update the user's FCM token for push notifications.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('token'):
        return jsonify({'error': 'Token is required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.fcm_token = data['token']
    db.session.commit()
    
    return jsonify({'message': 'Token updated'}), 200
