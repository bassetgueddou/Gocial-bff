"""
User model - the heart of Gocial

Three types of users here:
- person: regular folks looking for activities
- pro: businesses (bars, clubs, coaches, etc.)
- asso: associations & organizations

Each type has slightly different fields but they share the core stuff.
We went with single table inheritance instead of separate tables because
the overlap is like 80% and joins suck.
"""

from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


# Many-to-many relationship between users and roles
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True)
)


class Role(db.Model):
    """
    User role for authorization.
    
    Roles:
    - user: regular user (default)
    - moderator: can review reports, suspend activities
    - admin: full access, can manage users and content
    """
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    
    def __repr__(self):
        return f'<Role({self.name})>'
    
    @classmethod
    def get_or_create(cls, name, description=None):
        """Get existing role or create new one."""
        role = cls.query.filter_by(name=name).first()
        if not role:
            role = cls(name=name, description=description)
            db.session.add(role)
            db.session.commit()
        return role


class User(db.Model):
    __tablename__ = 'users'
    
    # === Core identity ===
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    user_type = db.Column(db.String(20), nullable=False, default='person')
    
    # === Admin flag (shortcut for checking admin role) ===
    is_admin = db.Column(db.Boolean, default=False)
    
    # === Personal info ===
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))

    pseudo = db.Column(db.String(50), unique=True, index=True)
    phone = db.Column(db.String(20))
    birth_date = db.Column(db.Date)
    gender = db.Column(db.String(20))  # male, female, non-binary, prefer_not_to_say
    
    # === Pro/Asso specific ===
    company_name = db.Column(db.String(100))
    siret = db.Column(db.String(20))  # French business ID
    description = db.Column(db.Text)
    website = db.Column(db.String(200))
    
    # === Location ===
    city = db.Column(db.String(100), index=True)
    address = db.Column(db.String(200))
    postal_code = db.Column(db.String(10))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # === Profile content ===
    avatar_url = db.Column(db.String(500))
    cover_url = db.Column(db.String(500))
    bio = db.Column(db.Text)
    
    # === Social links ===
    instagram = db.Column(db.String(100))
    facebook = db.Column(db.String(100))
    tiktok = db.Column(db.String(100))
    snapchat = db.Column(db.String(100))
    
    # === Account status ===
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)  # soft delete flag
    is_premium = db.Column(db.Boolean, default=False)
    premium_type = db.Column(db.String(20))  # 'standard', 'plus'
    premium_until = db.Column(db.DateTime)
    
    # === Privacy & preferences ===
    is_ghost_mode = db.Column(db.Boolean, default=False)  # hide from discovery
    girls_only_mode = db.Column(db.Boolean, default=False)  # women-only events
    dark_mode = db.Column(db.Boolean, default=False)
    language = db.Column(db.String(5), default='fr')
    
    # === Notification preferences ===
    notif_new_activity = db.Column(db.Boolean, default=True)
    notif_friend_request = db.Column(db.Boolean, default=True)
    notif_messages = db.Column(db.Boolean, default=True)
    notif_participation = db.Column(db.Boolean, default=True)
    notif_push_enabled = db.Column(db.Boolean, default=True)
    fcm_token = db.Column(db.String(500))  # Firebase Cloud Messaging token
    
    # === Timestamps ===
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    last_seen = db.Column(db.DateTime)
    
    # === Relations ===
    # Activities this user is hosting
    hosted_activities = db.relationship(
        'Activity', 
        backref='host', 
        lazy='dynamic',
        foreign_keys='Activity.host_id'
    )
    
    # Participation records
    participations = db.relationship(
        'Participation', 
        backref='user', 
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    # Friend relationships (where this user initiated)
    friendships = db.relationship(
        'Friendship',
        foreign_keys='Friendship.user_id',
        backref='requester',
        lazy='dynamic'
    )
    
    # User roles (admin, moderator, etc.)
    roles = db.relationship(
        'Role',
        secondary=user_roles,
        lazy='subquery',
        backref=db.backref('users', lazy=True)
    )
    
    # -------------------------------------------------------------------
    # Password handling
    # -------------------------------------------------------------------
    
    def set_password(self, password):
        """Hash and store password. Never store plaintext!"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against stored hash."""
        return check_password_hash(self.password_hash, password)
    
    # -------------------------------------------------------------------
    # Role management
    # -------------------------------------------------------------------
    
    def has_role(self, role_name):
        """Check if user has a specific role."""
        return any(role.name == role_name for role in self.roles)
    
    def add_role(self, role):
        """Add a role to this user."""
        if isinstance(role, str):
            role = Role.get_or_create(role)
        if role not in self.roles:
            self.roles.append(role)
    
    def remove_role(self, role_name):
        """Remove a role from this user."""
        self.roles = [r for r in self.roles if r.name != role_name]
    
    # -------------------------------------------------------------------
    # Age calculation helper
    # -------------------------------------------------------------------

    
    @property
    def age(self):
        """Calculate age from birth_date. Returns None if not set."""
        if not self.birth_date:
            return None
        today = datetime.utcnow().date()
        born = self.birth_date
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    
    # -------------------------------------------------------------------
    # Serialization
    # -------------------------------------------------------------------
    
    def to_dict(self, include_private=False, include_settings=False):
        """
        Convert user to dict for API response.
        
        include_private: add email, phone, etc. (only for own profile)
        include_settings: add notification prefs and such
        """
        data = {
            'id': self.id,
            'pseudo': self.pseudo,
            'first_name': self.first_name,
            'user_type': self.user_type,
            'city': self.city,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'is_verified': self.is_verified,
            'is_premium': self.is_premium,
            'age': self.age,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        # Pro/Asso get extra public fields
        if self.user_type in ('pro', 'asso'):
            data.update({
                'company_name': self.company_name,
                'description': self.description,
                'website': self.website,
            })
        
        # Social links - public for everyone
        data['socials'] = {
            'instagram': self.instagram,
            'facebook': self.facebook,
            'tiktok': self.tiktok,
            'snapchat': self.snapchat,
        }
        
        # Private fields - only visible to the user themselves
        if include_private:
            data.update({
                'email': self.email,
                'phone': self.phone,
                'birth_date': self.birth_date.isoformat() if self.birth_date else None,
                'gender': self.gender,
                'last_name': self.last_name,
                'address': self.address,
                'postal_code': self.postal_code,
            })
        
        # Settings - for profile edit screens
        if include_settings:
            data['settings'] = {
                'is_ghost_mode': self.is_ghost_mode,
                'girls_only_mode': self.girls_only_mode,
                'dark_mode': self.dark_mode,
                'language': self.language,
                'notifications': {
                    'new_activity': self.notif_new_activity,
                    'friend_request': self.notif_friend_request,
                    'messages': self.notif_messages,
                    'participation': self.notif_participation,
                    'push_enabled': self.notif_push_enabled,
                }
            }
        
        return data
    
    def __repr__(self):
        return f'<User #{self.id} {self.pseudo or self.email}>'
