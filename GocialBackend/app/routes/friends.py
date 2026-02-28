"""
Friends management routes

Friend requests, accepting, rejecting, blocking.
The social glue of the app.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.models import User, Friendship

friends_bp = Blueprint('friends', __name__)


# ---------------------------------------------------------------------
# Get my friends
# ---------------------------------------------------------------------

@friends_bp.route('/', methods=['GET'])
@jwt_required()
def get_friends():
    """
    Get list of accepted friends.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)
    
    # Query friendships where we're involved and status is accepted
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)),
        Friendship.status == 'accepted'
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    friends = []
    for f in friendships.items:
        # Get the other user (not us)
        friend_id = f.friend_id if f.user_id == user_id else f.user_id
        friend = User.query.get(friend_id)
        
        if friend and friend.is_active:
            friends.append({
                'friendship_id': f.id,
                'user': friend.to_dict(),
                'since': f.updated_at.isoformat() if f.updated_at else f.created_at.isoformat(),
            })
    
    return jsonify({
        'friends': friends,
        'total': friendships.total,
        'pages': friendships.pages,
        'current_page': page,
    }), 200


# ---------------------------------------------------------------------
# Get pending requests
# ---------------------------------------------------------------------

@friends_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    """
    Get pending friend requests (both sent and received).
    """
    user_id = get_jwt_identity()
    
    # Requests we received
    received = Friendship.query.filter_by(
        friend_id=user_id,
        status='pending'
    ).all()
    
    # Requests we sent
    sent = Friendship.query.filter_by(
        user_id=user_id,
        status='pending'
    ).all()
    
    received_data = []
    for f in received:
        sender = User.query.get(f.user_id)
        if sender:
            received_data.append({
                'friendship_id': f.id,
                'user': sender.to_dict(),
                'requested_at': f.created_at.isoformat(),
            })
    
    sent_data = []
    for f in sent:
        recipient = User.query.get(f.friend_id)
        if recipient:
            sent_data.append({
                'friendship_id': f.id,
                'user': recipient.to_dict(),
                'requested_at': f.created_at.isoformat(),
            })
    
    return jsonify({
        'received': received_data,
        'sent': sent_data,
    }), 200


# ---------------------------------------------------------------------
# Send friend request
# ---------------------------------------------------------------------

@friends_bp.route('/request/<int:target_user_id>', methods=['POST'])
@jwt_required()
def send_friend_request(target_user_id):
    """
    Send a friend request to another user.
    """
    user_id = get_jwt_identity()
    
    # Can't friend yourself bro
    if target_user_id == user_id:
        return jsonify({'error': 'Cannot send request to yourself'}), 400
    
    # Check if target exists
    target = User.query.get(target_user_id)
    if not target or not target.is_active:
        return jsonify({'error': 'User not found'}), 404
    
    # Check existing friendship status
    existing = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == target_user_id)) |
        ((Friendship.user_id == target_user_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if existing:
        if existing.status == 'accepted':
            return jsonify({'error': 'Already friends'}), 400
        elif existing.status == 'pending':
            # Maybe they already sent us a request - accept it
            if existing.user_id == target_user_id:
                existing.status = 'accepted'
                existing.accepted_at = datetime.utcnow()
                existing.updated_at = datetime.utcnow()
                db.session.commit()
                return jsonify({'message': 'Friend request accepted'}), 200
            else:
                return jsonify({'error': 'Request already pending'}), 400
        elif existing.status == 'blocked':
            # One of us blocked the other
            return jsonify({'error': 'Cannot send request'}), 400
    
    # Create new friendship request
    friendship = Friendship(
        user_id=user_id,
        friend_id=target_user_id,
        status='pending'
    )
    
    db.session.add(friendship)
    db.session.commit()
    
    # TODO: Send notification to target
    
    return jsonify({
        'message': 'Friend request sent',
        'friendship_id': friendship.id
    }), 201


# ---------------------------------------------------------------------
# Accept friend request
# ---------------------------------------------------------------------

@friends_bp.route('/request/<int:friendship_id>/accept', methods=['POST'])
@jwt_required()
def accept_friend_request(friendship_id):
    """
    Accept a pending friend request.
    """
    user_id = get_jwt_identity()
    
    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Request not found'}), 404
    
    # Must be the recipient to accept
    if friendship.friend_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    if friendship.status != 'pending':
        return jsonify({'error': 'Request is not pending'}), 400
    
    friendship.status = 'accepted'
    friendship.accepted_at = datetime.utcnow()
    friendship.updated_at = datetime.utcnow()
    db.session.commit()
    
    # TODO: Notify the sender
    
    return jsonify({'message': 'Friend request accepted'}), 200


# ---------------------------------------------------------------------
# Reject friend request
# ---------------------------------------------------------------------

@friends_bp.route('/request/<int:friendship_id>/reject', methods=['POST'])
@jwt_required()
def reject_friend_request(friendship_id):
    """
    Reject a pending friend request.
    """
    user_id = get_jwt_identity()
    
    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Request not found'}), 404
    
    # Must be the recipient to reject
    if friendship.friend_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    if friendship.status != 'pending':
        return jsonify({'error': 'Request is not pending'}), 400
    
    # Just delete it - they can try again later
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({'message': 'Friend request rejected'}), 200


# ---------------------------------------------------------------------
# Cancel sent request
# ---------------------------------------------------------------------

@friends_bp.route('/request/<int:friendship_id>/cancel', methods=['DELETE'])
@jwt_required()
def cancel_friend_request(friendship_id):
    """
    Cancel a friend request you sent.
    """
    user_id = get_jwt_identity()
    
    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Request not found'}), 404
    
    # Must be the sender to cancel
    if friendship.user_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    if friendship.status != 'pending':
        return jsonify({'error': 'Cannot cancel, request is not pending'}), 400
    
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({'message': 'Request cancelled'}), 200


# ---------------------------------------------------------------------
# Remove friend
# ---------------------------------------------------------------------

@friends_bp.route('/<int:friend_id>', methods=['DELETE'])
@jwt_required()
def remove_friend(friend_id):
    """
    Remove someone from your friends list.
    """
    user_id = get_jwt_identity()
    
    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id)),
        Friendship.status == 'accepted'
    ).first()
    
    if not friendship:
        return jsonify({'error': 'Not friends'}), 404
    
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({'message': 'Friend removed'}), 200


# ---------------------------------------------------------------------
# Block user
# ---------------------------------------------------------------------

@friends_bp.route('/block/<int:target_user_id>', methods=['POST'])
@jwt_required()
def block_user(target_user_id):
    """
    Block a user.
    
    They won't be able to see your profile or activities,
    send you messages, or add you as friend.
    """
    user_id = get_jwt_identity()
    
    if target_user_id == user_id:
        return jsonify({'error': 'Cannot block yourself'}), 400
    
    target = User.query.get(target_user_id)
    if not target:
        return jsonify({'error': 'User not found'}), 404
    
    # Check existing relationship
    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == target_user_id)) |
        ((Friendship.user_id == target_user_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if friendship:
        if friendship.status == 'blocked':
            # Already blocked (could be by them or us)
            # Make sure WE are the blocker
            friendship.user_id = user_id
            friendship.friend_id = target_user_id
        else:
            friendship.status = 'blocked'
            friendship.user_id = user_id
            friendship.friend_id = target_user_id
        friendship.updated_at = datetime.utcnow()
    else:
        friendship = Friendship(
            user_id=user_id,
            friend_id=target_user_id,
            status='blocked'
        )
        db.session.add(friendship)
    
    db.session.commit()
    
    return jsonify({'message': 'User blocked'}), 200


# ---------------------------------------------------------------------
# Unblock user
# ---------------------------------------------------------------------

@friends_bp.route('/block/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def unblock_user(target_user_id):
    """
    Unblock a previously blocked user.
    """
    user_id = get_jwt_identity()
    
    # Find the block (we must be the one who blocked)
    friendship = Friendship.query.filter_by(
        user_id=user_id,
        friend_id=target_user_id,
        status='blocked'
    ).first()
    
    if not friendship:
        return jsonify({'error': 'User is not blocked'}), 404
    
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({'message': 'User unblocked'}), 200


# ---------------------------------------------------------------------
# Get blocked users
# ---------------------------------------------------------------------

@friends_bp.route('/blocked', methods=['GET'])
@jwt_required()
def get_blocked_users():
    """
    Get list of users you've blocked.
    """
    user_id = get_jwt_identity()
    
    blocks = Friendship.query.filter_by(
        user_id=user_id,
        status='blocked'
    ).all()
    
    blocked = []
    for b in blocks:
        blocked_user = User.query.get(b.friend_id)
        if blocked_user:
            blocked.append({
                'user': blocked_user.to_dict(),
                'blocked_at': b.updated_at.isoformat() if b.updated_at else b.created_at.isoformat(),
            })
    
    return jsonify({'blocked': blocked}), 200


# ---------------------------------------------------------------------
# Check friendship status
# ---------------------------------------------------------------------

@friends_bp.route('/status/<int:target_user_id>', methods=['GET'])
@jwt_required()
def get_friendship_status(target_user_id):
    """
    Check the friendship status with another user.
    
    Returns: none, pending_sent, pending_received, friends, blocked
    """
    user_id = get_jwt_identity()
    
    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == target_user_id)) |
        ((Friendship.user_id == target_user_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if not friendship:
        return jsonify({'status': 'none'}), 200
    
    if friendship.status == 'accepted':
        status = 'friends'
    elif friendship.status == 'blocked':
        status = 'blocked'
    elif friendship.status == 'pending':
        status = 'pending_sent' if friendship.user_id == user_id else 'pending_received'
    else:
        status = 'none'
    
    return jsonify({
        'status': status,
        'friendship_id': friendship.id
    }), 200
