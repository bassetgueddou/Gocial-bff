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
    """Initialize database tables."""
    with app.app_context():
        db.create_all()
        print('Database initialized')


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
