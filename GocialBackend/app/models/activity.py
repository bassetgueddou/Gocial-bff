"""
Activity model - where the fun happens

Activities can be:
- Real: in-person meetups (hiking, parties, sports, etc.)
- Visio: online hangouts (language exchange, gaming, study groups)

The whole point of Gocial is connecting people through these activities,
so this model is pretty central to everything we do.
"""

from datetime import datetime
from app import db


class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # === Activity basics ===
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    activity_type = db.Column(db.String(20), nullable=False)  # 'real' or 'visio'
    
    # Category system - matches the frontend categories
    # Main categories: outings, sports, games, visio, diverse
    category = db.Column(db.String(50), nullable=False, index=True)
    subcategory = db.Column(db.String(50))  # e.g., 'bowling', 'hiking', 'board_games'
    
    # === Timing ===
    date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime)  # optional end time
    duration_minutes = db.Column(db.Integer)  # estimated duration
    
    # === Location (for real activities) ===
    address = db.Column(db.String(255))
    city = db.Column(db.String(100), index=True)
    postal_code = db.Column(db.String(10))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    meeting_point = db.Column(db.String(255))  # "in front of the statue", etc.
    
    # === Visio details ===
    visio_url = db.Column(db.String(500))
    visio_platform = db.Column(db.String(50))  # zoom, meet, discord, etc.
    
    # === Participants ===
    min_participants = db.Column(db.Integer, default=2)
    max_participants = db.Column(db.Integer, default=10)
    current_participants = db.Column(db.Integer, default=1)  # host counts as 1
    
    # === Restrictions / Requirements ===
    min_age = db.Column(db.Integer, default=18)
    max_age = db.Column(db.Integer, default=99)
    gender_restriction = db.Column(db.String(20), default='all')  # all, female, male
    
    # Who can join
    accept_non_verified = db.Column(db.Boolean, default=True)
    accept_non_premium = db.Column(db.Boolean, default=True)
    friends_only = db.Column(db.Boolean, default=False)
    
    # === Validation ===
    validation_type = db.Column(db.String(20), default='manual')  # manual or auto
    
    # === Visibility ===
    visibility = db.Column(db.String(20), default='public', index=True)  # public, friends, private
    is_featured = db.Column(db.Boolean, default=False)  # for promoted activities
    
    # === Media ===
    image_url = db.Column(db.String(500))
    
    # === Pricing (for future pro features) ===
    is_paid = db.Column(db.Boolean, default=False)
    price = db.Column(db.Float)
    currency = db.Column(db.String(3), default='EUR')
    
    # === Stats ===
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    
    # === Status ===
    # draft: not yet published
    # published: active and visible
    # full: max participants reached
    # cancelled: host cancelled it
    # completed: activity has ended
    status = db.Column(db.String(20), default='published', index=True)
    cancelled_reason = db.Column(db.String(255))
    
    # === Timestamps ===
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    
    # === Relationships ===
    participations = db.relationship(
        'Participation',
        backref='activity',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    likes = db.relationship(
        'ActivityLike',
        backref='activity',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    # -------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------
    
    @property
    def is_full(self):
        """Check if activity has reached max participants."""
        return self.current_participants >= self.max_participants
    
    @property
    def spots_left(self):
        """How many spots are still available."""
        return max(0, self.max_participants - self.current_participants)
    
    @property
    def is_past(self):
        """Check if activity date has passed."""
        return self.date < datetime.utcnow()
    
    def increment_views(self):
        """Bump the view counter."""
        self.views_count = (self.views_count or 0) + 1
    
    # -------------------------------------------------------------------
    # Serialization
    # -------------------------------------------------------------------
    
    def to_dict(self, include_host=True, viewer_id=None):
        """
        Convert to dict for API response.
        
        viewer_id: if provided, includes viewer-specific info (liked, participating)
        """
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'activity_type': self.activity_type,
            'category': self.category,
            'subcategory': self.subcategory,
            'date': self.date.isoformat() if self.date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'city': self.city,
            'address': self.address,
            'meeting_point': self.meeting_point,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'min_participants': self.min_participants,
            'max_participants': self.max_participants,
            'current_participants': self.current_participants,
            'spots_left': self.spots_left,
            'min_age': self.min_age,
            'max_age': self.max_age,
            'gender_restriction': self.gender_restriction,
            'validation_type': self.validation_type,
            'visibility': self.visibility,
            'image_url': self.image_url,
            'likes_count': self.likes_count,
            'status': self.status,
            'is_full': self.is_full,
            'is_past': self.is_past,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        # Visio-specific fields
        if self.activity_type == 'visio':
            data['visio_url'] = self.visio_url
            data['visio_platform'] = self.visio_platform
        
        # Include host info
        if include_host and self.host:
            data['host'] = {
                'id': self.host.id,
                'pseudo': self.host.pseudo,
                'first_name': self.host.first_name,
                'avatar_url': self.host.avatar_url,
                'is_verified': self.host.is_verified,
                'user_type': self.host.user_type,
            }
        
        # Viewer-specific info (requires database queries)
        if viewer_id:
            # This will be populated by the route handler
            # to avoid N+1 queries
            data['viewer_info'] = {
                'is_host': self.host_id == viewer_id,
                # is_liked and participation_status added by route
            }
        
        return data
    
    def __repr__(self):
        return f'<Activity #{self.id} "{self.title}">'


class Participation(db.Model):
    """
    Junction table for users participating in activities.
    
    Status flow:
    pending -> validated (accepted by host)
    pending -> rejected (declined by host)
    validated -> cancelled (user cancels)
    
    After the activity, we use this for ratings too.
    """
    __tablename__ = 'participations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False, index=True)
    
    status = db.Column(db.String(20), default='pending', index=True)
    
    # Optional message from participant ("Hey, I'd love to join!")
    request_message = db.Column(db.Text)
    
    # Response from host
    response_message = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    validated_at = db.Column(db.DateTime)
    
    # === Post-activity ratings ===
    # Rating given BY this participant TO the host (1-5)
    host_rating = db.Column(db.Integer)
    host_review = db.Column(db.Text)
    
    # Rating given BY the host TO this participant (1-5)
    participant_rating = db.Column(db.Integer)
    participant_review = db.Column(db.Text)
    
    # When ratings were submitted
    rated_at = db.Column(db.DateTime)
    
    # Ensure user can only participate once per activity
    __table_args__ = (
        db.UniqueConstraint('user_id', 'activity_id', name='uq_user_activity'),
    )
    
    def to_dict(self, include_user=False, include_activity=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'activity_id': self.activity_id,
            'status': self.status,
            'request_message': self.request_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'pseudo': self.user.pseudo,
                'first_name': self.user.first_name,
                'avatar_url': self.user.avatar_url,
                'age': self.user.age,
            }
        
        if include_activity and self.activity:
            data['activity'] = self.activity.to_dict(include_host=False)
        
        return data


class ActivityLike(db.Model):
    """Simple like/favorite system for activities."""
    __tablename__ = 'activity_likes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # One like per user per activity
    __table_args__ = (
        db.UniqueConstraint('user_id', 'activity_id', name='uq_user_activity_like'),
    )
