"""
Test factories using factory_boy.

Makes creating test data way easier than manually constructing objects.
Just do UserFactory() and boom, you got a user.
"""

from datetime import datetime, timedelta
import random

try:
    import factory
    from factory.alchemy import SQLAlchemyModelFactory
    HAS_FACTORY_BOY = True
except ImportError:
    HAS_FACTORY_BOY = False
    # Fallback for when factory_boy isn't installed
    class SQLAlchemyModelFactory:
        pass

from app import db
from app.models import User, Role, Activity, Participation, Friendship, Message


if HAS_FACTORY_BOY:
    
    class BaseFactory(SQLAlchemyModelFactory):
        """Base factory with session handling."""
        
        class Meta:
            abstract = True
            sqlalchemy_session = db.session
            sqlalchemy_session_persistence = 'commit'
    
    
    class RoleFactory(BaseFactory):
        """Creates Role instances."""
        
        class Meta:
            model = Role
        
        name = factory.Sequence(lambda n: f'role_{n}')
        description = factory.LazyAttribute(lambda obj: f'Description for {obj.name}')
    
    
    class UserFactory(BaseFactory):
        """
        Creates User instances.
        
        Usage:
            user = UserFactory()                          # basic user
            user = UserFactory(is_verified=True)          # verified user
            user = UserFactory(user_type='pro')           # pro user
            users = UserFactory.create_batch(10)          # 10 users
        """
        
        class Meta:
            model = User
        
        email = factory.Sequence(lambda n: f'user{n}@test.com')
        pseudo = factory.Sequence(lambda n: f'testuser{n}')
        first_name = factory.Faker('first_name')
        last_name = factory.Faker('last_name')
        user_type = 'person'
        is_active = True
        is_verified = False
        city = factory.Faker('city')
        
        @factory.lazy_attribute
        def password_hash(self):
            """Default password is 'testpass123'"""
            from werkzeug.security import generate_password_hash
            return generate_password_hash('testpass123')
        
        @classmethod
        def _create(cls, model_class, *args, **kwargs):
            """Override create to handle password properly."""
            password = kwargs.pop('password', None)
            obj = super()._create(model_class, *args, **kwargs)
            if password:
                obj.set_password(password)
                db.session.commit()
            return obj
    
    
    class ActivityFactory(BaseFactory):
        """Creates Activity instances."""
        
        class Meta:
            model = Activity
        
        title = factory.Sequence(lambda n: f'Test Activity {n}')
        description = factory.Faker('paragraph')
        activity_type = 'real'
        category = factory.LazyFunction(lambda: random.choice(['sport', 'party', 'culture', 'food']))
        status = 'published'
        visibility = 'public'
        max_participants = factory.LazyFunction(lambda: random.randint(3, 20))
        city = factory.Faker('city')
        
        # Date in the future
        date = factory.LazyFunction(lambda: datetime.utcnow() + timedelta(days=random.randint(1, 30)))
        
        # Host is auto-created if not provided
        host = factory.SubFactory(UserFactory)
        host_id = factory.LazyAttribute(lambda obj: obj.host.id)
    
    
    class ParticipationFactory(BaseFactory):
        """Creates Participation instances."""
        
        class Meta:
            model = Participation
        
        status = 'pending'
        user = factory.SubFactory(UserFactory)
        activity = factory.SubFactory(ActivityFactory)
        user_id = factory.LazyAttribute(lambda obj: obj.user.id)
        activity_id = factory.LazyAttribute(lambda obj: obj.activity.id)
    
    
    class FriendshipFactory(BaseFactory):
        """Creates Friendship instances."""
        
        class Meta:
            model = Friendship
        
        status = 'pending'
        user = factory.SubFactory(UserFactory)
        friend = factory.SubFactory(UserFactory)
        user_id = factory.LazyAttribute(lambda obj: obj.user.id)
        friend_id = factory.LazyAttribute(lambda obj: obj.friend.id)
    
    
    class MessageFactory(BaseFactory):
        """Creates Message instances."""
        
        class Meta:
            model = Message
        
        content = factory.Faker('sentence')
        message_type = 'text'
        is_read = False
        sender = factory.SubFactory(UserFactory)
        recipient = factory.SubFactory(UserFactory)
        sender_id = factory.LazyAttribute(lambda obj: obj.sender.id)
        recipient_id = factory.LazyAttribute(lambda obj: obj.recipient.id)


else:
    # Provide dummy factories when factory_boy isn't installed
    # So imports don't break
    
    class UserFactory:
        @staticmethod
        def create(**kwargs):
            user = User(
                email=kwargs.get('email', f'test{random.randint(1000,9999)}@test.com'),
                pseudo=kwargs.get('pseudo', f'test{random.randint(1000,9999)}'),
                user_type=kwargs.get('user_type', 'person'),
                is_active=True,
            )
            user.set_password(kwargs.get('password', 'testpass123'))
            db.session.add(user)
            db.session.commit()
            return user
    
    class ActivityFactory:
        @staticmethod
        def create(**kwargs):
            activity = Activity(
                title=kwargs.get('title', 'Test Activity'),
                activity_type=kwargs.get('activity_type', 'real'),
                status='published',
                host_id=kwargs.get('host_id', 1),
                date=datetime.utcnow() + timedelta(days=7),
            )
            db.session.add(activity)
            db.session.commit()
            return activity
    
    RoleFactory = None
    ParticipationFactory = None
    FriendshipFactory = None
    MessageFactory = None
