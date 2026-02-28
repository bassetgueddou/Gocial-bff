"""
Gocial Backend - Main application factory

This is where the magic happens. We're using the factory pattern here 
so we can spin up different app configs for dev/prod/testing without 
going crazy. Trust me, you'll thank yourself later.

@authors: Eleonore & the crew
"""

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail

from config import config

# Flask extensions - initialized here, bound to app later
# This pattern lets us avoid circular imports (been there, done that)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def create_app(config_name='default'):
    """
    App factory. Creates and configures a fresh Flask instance.
    
    Why factory pattern? Because:
    - Testing becomes way easier (fresh app per test)
    - Multiple configs without hacky globals
    - Cleaner imports, no circular dependency hell
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Wire up extensions
    _init_extensions(app)
    
    # Register all our API blueprints
    _register_blueprints(app)
    
    # Error handlers so we don't leak stack traces in prod
    _register_error_handlers(app)
    
    # CLI commands (flask test, flask seed, etc.)
    _register_commands(app)
    
    # Shell context for flask shell
    _register_shell_context(app)
    
    # Health check endpoint for load balancers / k8s probes
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'gocial-api', 'version': '1.0.0'}
    
    @app.route('/')
    def index():
        return {'message': 'Welcome to Gocial API', 'docs': '/api/docs'}
    
    return app


def _init_extensions(app):
    """Bind Flask extensions to the app instance."""
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    # CORS setup - allow mobile app & web to hit our API
    raw_origins = app.config.get('CORS_ORIGINS', '*')
    if isinstance(raw_origins, str) and ',' in raw_origins:
        allowed_origins = [o.strip() for o in raw_origins.split(',')]
    else:
        allowed_origins = raw_origins
    CORS(app, origins=allowed_origins, supports_credentials=True)
    
    # JWT error handlers for better DX
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token expired', 'code': 'token_expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token', 'code': 'invalid_token'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization required', 'code': 'auth_required'}), 401


def _register_blueprints(app):
    """
    Register all API blueprints with their URL prefixes.
    Keep this organized - future you will appreciate it.
    """
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.activities import activities_bp
    from app.routes.friends import friends_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    
    # All routes prefixed with /api for clarity
    blueprints = [
        (auth_bp, '/api/auth'),
        (users_bp, '/api/users'),
        (activities_bp, '/api/activities'),
        (friends_bp, '/api/friends'),
        (messages_bp, '/api/messages'),
        (notifications_bp, '/api/notifications'),
    ]
    
    for blueprint, prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)


def _register_error_handlers(app):
    """Global error handlers. Because shit happens."""
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        # Log this somewhere in prod (Sentry, CloudWatch, etc.)
        app.logger.error(f'Internal error: {e}')
        return jsonify({'error': 'Something went wrong on our end'}), 500
    
    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405


def _register_commands(app):
    """Register custom CLI commands."""
    from app.commands import register_commands
    register_commands(app)


def _register_shell_context(app):
    """
    Make models available in flask shell.
    
    Just run 'flask shell' and you can query the DB directly.
    """
    from app.models import User, Role, Activity, Participation, Friendship, Message, Notification
    
    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'User': User,
            'Role': Role,
            'Activity': Activity,
            'Participation': Participation,
            'Friendship': Friendship,
            'Message': Message,
            'Notification': Notification,
        }
