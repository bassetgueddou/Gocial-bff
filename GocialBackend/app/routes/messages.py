"""
Messaging routes

DMs, conversations, read status.
Direct messaging between users.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import and_, or_, func

from app import db
from app.models import User, Message, Friendship

messages_bp = Blueprint('messages', __name__)


def can_message(sender_id, recipient_id):
    """
    Check if sender is allowed to message recipient.
    
    Rules:
    - Can always message friends
    - If blocked, cannot message
    - Can send message requests to non-friends (they decide if they want to receive)
    """
    friendship = Friendship.query.filter(
        ((Friendship.user_id == sender_id) & (Friendship.friend_id == recipient_id)) |
        ((Friendship.user_id == recipient_id) & (Friendship.friend_id == sender_id))
    ).first()
    
    if friendship and friendship.status == 'blocked':
        return False, 'blocked'
    
    if friendship and friendship.status == 'accepted':
        return True, 'friend'
    
    return True, 'request'  # Can send as message request


# ---------------------------------------------------------------------
# Get conversations
# ---------------------------------------------------------------------

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """
    Get all conversations (list of people you've messaged with).
    
    Returns most recent message for each conversation.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 30, type=int), 50)
    
    # Find all users we have conversations with
    # This is a bit complex - need to get distinct conversations
    
    # Get all messages involving current user
    sent_to = db.session.query(Message.recipient_id.distinct())\
        .filter(Message.sender_id == user_id)\
        .filter(Message.deleted_by_sender == False)
    
    received_from = db.session.query(Message.sender_id.distinct())\
        .filter(Message.recipient_id == user_id)\
        .filter(Message.deleted_by_recipient == False)
    
    # Combine unique user IDs
    partner_ids = set()
    for (uid,) in sent_to.all():
        partner_ids.add(uid)
    for (uid,) in received_from.all():
        partner_ids.add(uid)
    
    conversations = []
    
    for partner_id in partner_ids:
        partner = User.query.get(partner_id)
        if not partner or not partner.is_active:
            continue
        
        # Get last message in this conversation
        last_msg = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == partner_id)) |
            ((Message.sender_id == partner_id) & (Message.recipient_id == user_id))
        ).filter(
            or_(
                and_(Message.sender_id == user_id, Message.deleted_by_sender == False),
                and_(Message.recipient_id == user_id, Message.deleted_by_recipient == False)
            )
        ).order_by(Message.created_at.desc()).first()
        
        if not last_msg:
            continue
        
        # Count unread messages
        unread = Message.query.filter(
            Message.sender_id == partner_id,
            Message.recipient_id == user_id,
            Message.is_read == False,
            Message.deleted_by_recipient == False
        ).count()
        
        conversations.append({
            'partner': partner.to_dict(),
            'last_message': {
                'id': last_msg.id,
                'content': last_msg.content if not last_msg.deleted_by_sender else '[deleted]',
                'sent_by_me': last_msg.sender_id == user_id,
                'sent_at': last_msg.created_at.isoformat(),
                'is_read': last_msg.is_read,
                'is_request': last_msg.is_request,
            },
            'unread_count': unread,
        })
    
    # Sort by most recent
    conversations.sort(key=lambda x: x['last_message']['sent_at'], reverse=True)
    
    # Manual pagination since we built the list manually
    total = len(conversations)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = conversations[start:end]
    
    return jsonify({
        'conversations': paginated,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page,
        'has_next': end < total,
    }), 200


# ---------------------------------------------------------------------
# Get message requests
# ---------------------------------------------------------------------

@messages_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_message_requests():
    """
    Get messages from people you're not friends with (message requests).
    """
    user_id = get_jwt_identity()
    
    # Get friend IDs
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)),
        Friendship.status == 'accepted'
    ).all()
    
    friend_ids = [f.friend_id if f.user_id == user_id else f.user_id for f in friendships]
    
    # Get messages from non-friends
    requests = Message.query.filter(
        Message.recipient_id == user_id,
        Message.is_request == True,
        Message.deleted_by_recipient == False,
        ~Message.sender_id.in_(friend_ids) if friend_ids else True
    ).order_by(Message.created_at.desc()).all()
    
    # Group by sender
    by_sender = {}
    for msg in requests:
        if msg.sender_id not in by_sender:
            sender = User.query.get(msg.sender_id)
            if sender and sender.is_active:
                by_sender[msg.sender_id] = {
                    'sender': sender.to_dict(),
                    'messages': [],
                    'first_message_at': msg.created_at.isoformat(),
                }
        if msg.sender_id in by_sender:
            by_sender[msg.sender_id]['messages'].append({
                'id': msg.id,
                'content': msg.content,
                'sent_at': msg.created_at.isoformat(),
            })
    
    return jsonify({
        'requests': list(by_sender.values())
    }), 200


# ---------------------------------------------------------------------
# Get messages with a user
# ---------------------------------------------------------------------

@messages_bp.route('/with/<int:partner_id>', methods=['GET'])
@jwt_required()
def get_messages(partner_id):
    """
    Get conversation history with a specific user.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)
    
    partner = User.query.get(partner_id)
    if not partner:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if blocked
    can_msg, status = can_message(user_id, partner_id)
    if status == 'blocked':
        return jsonify({'error': 'Cannot view messages'}), 403
    
    # Get messages
    query = Message.query.filter(
        ((Message.sender_id == user_id) & (Message.recipient_id == partner_id)) |
        ((Message.sender_id == partner_id) & (Message.recipient_id == user_id))
    ).filter(
        or_(
            and_(Message.sender_id == user_id, Message.deleted_by_sender == False),
            and_(Message.recipient_id == user_id, Message.deleted_by_recipient == False)
        )
    ).order_by(Message.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    messages = []
    for msg in pagination.items:
        messages.append({
            'id': msg.id,
            'content': msg.content,
            'sent_by_me': msg.sender_id == user_id,
            'sent_at': msg.created_at.isoformat(),
            'is_read': msg.is_read,
            'message_type': msg.message_type,
        })
    
    # Mark received messages as read
    Message.query.filter(
        Message.sender_id == partner_id,
        Message.recipient_id == user_id,
        Message.is_read == False
    ).update({'is_read': True, 'read_at': datetime.utcnow()})
    db.session.commit()
    
    return jsonify({
        'partner': partner.to_dict(),
        'messages': messages,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_more': pagination.has_next,
    }), 200


# ---------------------------------------------------------------------
# Send message
# ---------------------------------------------------------------------

@messages_bp.route('/send/<int:recipient_id>', methods=['POST'])
@jwt_required()
def send_message(recipient_id):
    """
    Send a message to someone.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content', '').strip():
        return jsonify({'error': 'Message content is required'}), 400
    
    recipient = User.query.get(recipient_id)
    if not recipient or not recipient.is_active:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if we can message
    can_msg, status = can_message(user_id, recipient_id)
    if not can_msg:
        return jsonify({'error': 'Cannot send message to this user'}), 403
    
    content = data['content'].strip()
    
    # Create message
    message = Message(
        sender_id=user_id,
        recipient_id=recipient_id,
        content=content,
        message_type=data.get('type', 'text'),
        is_request=(status == 'request'),  # Mark as request if not friends
    )
    
    db.session.add(message)
    db.session.commit()
    
    # TODO: Send push notification
    
    return jsonify({
        'message': 'Message sent',
        'data': {
            'id': message.id,
            'content': message.content,
            'sent_at': message.created_at.isoformat(),
            'is_request': message.is_request,
        }
    }), 201


# ---------------------------------------------------------------------
# Accept message request
# ---------------------------------------------------------------------

@messages_bp.route('/requests/<int:sender_id>/accept', methods=['POST'])
@jwt_required()
def accept_message_request(sender_id):
    """
    Accept message requests from a user.
    
    This moves their messages from requests to regular inbox.
    """
    user_id = get_jwt_identity()
    
    # Update all their messages to not be requests
    updated = Message.query.filter(
        Message.sender_id == sender_id,
        Message.recipient_id == user_id,
        Message.is_request == True
    ).update({'is_request': False})
    
    if updated == 0:
        return jsonify({'error': 'No request from this user'}), 404
    
    db.session.commit()
    
    return jsonify({'message': 'Message request accepted'}), 200


# ---------------------------------------------------------------------
# Delete message request (block/ignore)
# ---------------------------------------------------------------------

@messages_bp.route('/requests/<int:sender_id>', methods=['DELETE'])
@jwt_required()
def delete_message_request(sender_id):
    """
    Delete all message requests from a user.
    
    Optionally block them too.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    should_block = data.get('block', False)
    
    # Soft delete messages
    Message.query.filter(
        Message.sender_id == sender_id,
        Message.recipient_id == user_id,
        Message.is_request == True
    ).update({'deleted_by_recipient': True})
    
    db.session.commit()
    
    if should_block:
        # Create block relationship
        existing = Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == sender_id)) |
            ((Friendship.user_id == sender_id) & (Friendship.friend_id == user_id))
        ).first()
        
        if existing:
            existing.status = 'blocked'
            existing.user_id = user_id
            existing.friend_id = sender_id
        else:
            block = Friendship(
                user_id=user_id,
                friend_id=sender_id,
                status='blocked'
            )
            db.session.add(block)
        
        db.session.commit()
    
    return jsonify({'message': 'Request deleted'}), 200


# ---------------------------------------------------------------------
# Delete a message
# ---------------------------------------------------------------------

@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """
    Delete a message (soft delete for your side only).
    """
    user_id = get_jwt_identity()
    
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    # Can only delete your own messages (sent or received)
    if message.sender_id == user_id:
        message.deleted_by_sender = True
    elif message.recipient_id == user_id:
        message.deleted_by_recipient = True
    else:
        return jsonify({'error': 'Not your message'}), 403
    
    db.session.commit()
    
    return jsonify({'message': 'Message deleted'}), 200


# ---------------------------------------------------------------------
# Mark as read
# ---------------------------------------------------------------------

@messages_bp.route('/read/<int:partner_id>', methods=['POST'])
@jwt_required()
def mark_conversation_read(partner_id):
    """
    Mark all messages from a user as read.
    """
    user_id = get_jwt_identity()
    
    updated = Message.query.filter(
        Message.sender_id == partner_id,
        Message.recipient_id == user_id,
        Message.is_read == False
    ).update({'is_read': True, 'read_at': datetime.utcnow()})
    
    db.session.commit()
    
    return jsonify({
        'message': 'Messages marked as read',
        'count': updated
    }), 200


# ---------------------------------------------------------------------
# Get unread count
# ---------------------------------------------------------------------

@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    Get total unread message count.
    """
    user_id = get_jwt_identity()
    
    count = Message.query.filter(
        Message.recipient_id == user_id,
        Message.is_read == False,
        Message.deleted_by_recipient == False
    ).count()
    
    # Also count message requests separately
    requests_count = Message.query.filter(
        Message.recipient_id == user_id,
        Message.is_read == False,
        Message.is_request == True,
        Message.deleted_by_recipient == False
    ).count()
    
    return jsonify({
        'total_unread': count,
        'requests_unread': requests_count,
        'direct_unread': count - requests_count,
    }), 200
