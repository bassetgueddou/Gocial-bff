"""
Social features - friendships, messages, notifications

The social layer that makes Gocial more than just an event board.
People wanna meet friends, chat, and stay in the loop.
"""

from datetime import datetime
from app import db


class Friendship(db.Model):
    """
    Friendship connections between users.
    
    The relationship is directional for requests (user_id -> friend_id)
    but once accepted, it works both ways. We handle that in queries.
    
    Status:
    - pending: request sent, waiting for response
    - accepted: they're friends now
    - rejected: declined the request
    - blocked: one user blocked the other
    """
    __tablename__ = 'friendships'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    status = db.Column(db.String(20), default='pending', index=True)
    
    # Who blocked whom (if status is 'blocked')
    blocked_by = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    accepted_at = db.Column(db.DateTime)
    
    # Relationships
    friend = db.relationship('User', foreign_keys=[friend_id], backref='friend_requests_received')
    
    # Prevent duplicate friendship requests
    __table_args__ = (
        db.UniqueConstraint('user_id', 'friend_id', name='uq_friendship'),
    )
    
    def to_dict(self, perspective_user_id=None):
        """
        Convert to dict. perspective_user_id determines which user info to include.
        """
        data = {
            'id': self.id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        # Include the "other" user's info based on who's viewing
        if perspective_user_id == self.user_id and self.friend:
            data['friend'] = {
                'id': self.friend.id,
                'pseudo': self.friend.pseudo,
                'first_name': self.friend.first_name,
                'avatar_url': self.friend.avatar_url,
                'city': self.friend.city,
            }
        elif perspective_user_id == self.friend_id:
            # They received the request, show who sent it
            from app.models import User
            requester = User.query.get(self.user_id)
            if requester:
                data['friend'] = {
                    'id': requester.id,
                    'pseudo': requester.pseudo,
                    'first_name': requester.first_name,
                    'avatar_url': requester.avatar_url,
                    'city': requester.city,
                }
        
        return data


class Message(db.Model):
    """
    Direct messages between users.
    
    Messages can optionally be linked to an activity
    (e.g., "hey about that hiking trip...").
    
    For now it's just text, but we might add images/attachments later.
    """
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    content = db.Column(db.Text, nullable=False)
    
    # Optional: link to an activity for context
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), index=True)
    
    # Message type for special messages
    # 'text': normal message
    # 'activity_invite': invitation to an activity
    # 'system': automated message
    message_type = db.Column(db.String(20), default='text')
    
    # Messages from non-friends are treated as "requests"
    # The recipient decides whether to accept or ignore them
    is_request = db.Column(db.Boolean, default=False)
    
    is_read = db.Column(db.Boolean, default=False, index=True)
    read_at = db.Column(db.DateTime)
    
    # Soft delete - hide from one or both users
    deleted_by_sender = db.Column(db.Boolean, default=False)
    deleted_by_recipient = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    activity = db.relationship('Activity', backref='related_messages')
    
    def mark_as_read(self):
        """Mark message as read with timestamp."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
    
    def to_dict(self, current_user_id=None):
        data = {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'content': self.content,
            'message_type': self.message_type,
            'is_request': self.is_request,
            'is_read': self.is_read,
            'activity_id': self.activity_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_mine': self.sender_id == current_user_id if current_user_id else None,
        }
        
        # Include sender basic info
        if self.sender:
            data['sender'] = {
                'id': self.sender.id,
                'pseudo': self.sender.pseudo,
                'avatar_url': self.sender.avatar_url,
            }
        
        return data


class Notification(db.Model):
    """
    Push notification records.
    
    Types of notifications we send:
    - friend_request: someone wants to be friends
    - friend_accepted: your request was accepted
    - participation_request: someone wants to join your activity
    - participation_accepted: you got accepted to an activity
    - participation_rejected: you got rejected (sad)
    - new_message: you got a DM
    - activity_reminder: activity starts soon
    - activity_cancelled: host cancelled
    - rate_reminder: please rate the activity you attended
    """
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Who triggered this notification (the person who did the action)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    
    notif_type = db.Column(db.String(50), nullable=False, index=True)
    title = db.Column(db.String(150))
    body = db.Column(db.Text)
    
    # JSON data for app to handle - e.g., {"activity_id": 123, "user_id": 456}
    # The app uses this to navigate to the right screen
    data = db.Column(db.JSON)
    
    # Image to show in notification (usually avatar)
    image_url = db.Column(db.String(500))
    
    # Action URL for deep linking
    action_url = db.Column(db.String(255))
    
    is_read = db.Column(db.Boolean, default=False, index=True)
    read_at = db.Column(db.DateTime)
    
    # Was push actually sent? (for debugging)
    push_sent = db.Column(db.Boolean, default=False)
    push_sent_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('notifications', lazy='dynamic'))
    actor = db.relationship('User', foreign_keys=[actor_id])
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
    
    def to_dict(self):
        data = {
            'id': self.id,
            'type': self.notif_type,
            'title': self.title,
            'body': self.body,
            'data': self.data,
            'image_url': self.image_url,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if self.actor_id and self.actor:
            data['actor'] = {
                'id': self.actor.id,
                'pseudo': self.actor.pseudo,
                'avatar_url': self.actor.avatar_url,
            }
        
        return data


class Report(db.Model):
    """
    User reports for moderation.
    
    Users can report activities, other users, or messages.
    We review these manually (for now).
    """
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # What's being reported
    report_type = db.Column(db.String(20), nullable=False)  # 'user', 'activity', 'message'
    reported_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    reported_activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), index=True)
    reported_message_id = db.Column(db.Integer, db.ForeignKey('messages.id'), index=True)
    
    # Reason categories
    # inappropriate, spam, harassment, fake, dangerous, other
    reason = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text)
    
    # Moderation status
    # pending, reviewing, resolved, dismissed
    status = db.Column(db.String(20), default='pending', index=True)
    
    # Admin who handled it
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolution_notes = db.Column(db.Text)
    resolved_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reporter = db.relationship('User', foreign_keys=[reporter_id])
    reported_user = db.relationship('User', foreign_keys=[reported_user_id])
    reported_activity = db.relationship('Activity')
    reported_message = db.relationship('Message')
