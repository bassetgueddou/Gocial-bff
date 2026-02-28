"""
Gocial Backend - Entry point

Run this file to start the development server.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app import create_app, db

# Create the Flask app
env = os.getenv('FLASK_ENV', 'development')
app = create_app(env)


def init_db():
    """Initialize database tables (only if no migration history)."""
    with app.app_context():
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        if not inspector.has_table('alembic_version'):
            db.create_all()
            print('Database tables created (no migrations found)')
        else:
            print('Alembic migrations detected — skipping db.create_all()')


if __name__ == '__main__':
    # Create database tables on first run
    init_db()
    
    # Get config
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    
    print(f'\n🚀 Starting Gocial API server')
    print(f'   Environment: {env}')
    print(f'   Debug: {debug}')
    print(f'   URL: http://localhost:{port}')
    print('')
    
    app.run(host=host, port=port, debug=debug)
