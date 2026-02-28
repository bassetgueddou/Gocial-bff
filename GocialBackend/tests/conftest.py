"""
Pytest fixtures for Gocial tests.

These fixtures are automatically available to all tests.
No need to import them - pytest handles that.
"""

import logging
import pytest
from flask_jwt_extended import create_access_token

from app import create_app, db
from app.models import User, Role


@pytest.fixture(scope='function')
def app():
    """
    Create a fresh app instance for each test.
    
    Uses the 'testing' config which has:
    - In-memory SQLite database
    - Testing mode enabled
    - Debug disabled
    """
    _app = create_app('testing')
    _app.logger.setLevel(logging.CRITICAL)  # Quiet logs during tests
    
    with _app.app_context():
        db.create_all()
        yield _app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Flask test client for making requests."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """CLI runner for testing Flask commands."""
    return app.test_cli_runner()


@pytest.fixture
def db_session(app):
    """
    Provide a clean database session.
    
    Useful when you need direct DB access in tests.
    """
    with app.app_context():
        yield db
        db.session.rollback()


@pytest.fixture
def user(app):
    """
    Create a basic test user.
    
    Password is 'testpass123'
    """
    with app.app_context():
        user = User(
            email='test@example.com',
            pseudo='testuser',
            first_name='Test',
            last_name='User',
            user_type='person',
            is_active=True,
            is_verified=True,
        )
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        
        # Refresh to get the id
        db.session.refresh(user)
        return user


@pytest.fixture
def admin_user(app):
    """
    Create an admin user.
    
    Password is 'adminpass123'
    """
    with app.app_context():
        admin_role = Role.get_or_create('admin', 'Full access')
        
        user = User(
            email='admin@example.com',
            pseudo='adminuser',
            first_name='Admin',
            last_name='User',
            user_type='person',
            is_active=True,
            is_verified=True,
            is_admin=True,
        )
        user.set_password('adminpass123')
        user.add_role(admin_role)
        db.session.add(user)
        db.session.commit()
        
        db.session.refresh(user)
        return user


@pytest.fixture
def auth_headers(app, user):
    """
    Get authorization headers with valid JWT token.
    
    Use this fixture when testing protected endpoints:
        def test_something(client, auth_headers):
            response = client.get('/api/users/me', headers=auth_headers)
    """
    with app.app_context():
        token = create_access_token(identity=user.id)
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_auth_headers(app, admin_user):
    """Authorization headers with admin JWT token."""
    with app.app_context():
        token = create_access_token(identity=admin_user.id)
        return {'Authorization': f'Bearer {token}'}


# -----------------------------------------------------------------------
# Factory imports (only if factory_boy is installed)
# -----------------------------------------------------------------------

try:
    from tests.factories import (
        UserFactory, 
        ActivityFactory, 
        ParticipationFactory,
        FriendshipFactory,
        MessageFactory,
    )
    
    @pytest.fixture
    def user_factory(app):
        """Provide UserFactory with app context."""
        return UserFactory
    
    @pytest.fixture
    def activity_factory(app):
        """Provide ActivityFactory with app context."""
        return ActivityFactory
        
except ImportError:
    pass  # factory_boy not installed, skip these fixtures
