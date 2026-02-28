# Gocial Backend

REST API backend for Gocial - a social activity-sharing platform built with Flask.

## Quick Start

```bash
# clone and setup
cd GocialBackend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# install deps
pip install -r requirements.txt

# setup database
flask db upgrade

# run server
flask run
```

Server runs at `http://localhost:5000`

## Docker Setup

```bash
# build and run everything
docker-compose up --build

# just the api
docker-compose up api

# fresh start (wipes volumes)
docker-compose down -v && docker-compose up --build
```

Services:
- **api**: Flask app on port 5000
- **db**: PostgreSQL on port 5432
- **redis**: Cache on port 6379
- **adminer**: DB GUI on port 8080

## CLI Commands

```bash
flask test              # run test suite with coverage
flask lint              # format code (black + isort + flake8)
flask seed              # populate db with sample data
flask reset-db          # drop and recreate all tables
flask create-admin      # create admin user (prompts for creds)
```

## Environment Variables

Create a `.env` file:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# database
DATABASE_URL=sqlite:///gocial.db
# or for postgres:
# DATABASE_URL=postgresql://gocial:gocial@localhost:5432/gocial

# mail (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Project Structure

```
GocialBackend/
├── app/
│   ├── __init__.py      # app factory
│   ├── config.py        # configuration classes
│   ├── extensions.py    # flask extensions init
│   ├── commands.py      # cli commands
│   ├── models/          # sqlalchemy models
│   │   ├── base.py      # CRUDMixin, PkModel
│   │   ├── user.py      # User, Role
│   │   ├── activity.py  # Activity, Participation
│   │   └── social.py    # Friendship, Message, Notification
│   ├── routes/          # api blueprints
│   │   ├── auth.py      # /api/auth/*
│   │   ├── users.py     # /api/users/*
│   │   ├── activities.py
│   │   ├── friends.py
│   │   ├── messages.py
│   │   └── notifications.py
│   └── utils/           # helpers
│       ├── auth.py      # jwt/password utils
│       └── email.py     # email sending
├── migrations/          # alembic migrations
├── tests/               # pytest test suite
│   ├── conftest.py      # fixtures
│   └── factories.py     # factory-boy factories
├── Dockerfile
├── docker-compose.yml
├── Procfile             # heroku/railway deploy
└── requirements.txt
```

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Get JWT tokens |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Current user profile |
| POST | `/change-password` | Update password |
| POST | `/forgot-password` | Request reset email |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/<id>` | Get user profile |
| PUT | `/profile` | Update own profile |
| POST | `/profile/avatar` | Upload avatar |
| GET | `/search` | Search users |
| GET | `/<id>/activities` | User's activities |

### Activities (`/api/activities`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List activities (filtered) |
| POST | `/` | Create activity |
| GET | `/top` | Top 3 activities |
| GET | `/<id>` | Activity details |
| PUT | `/<id>` | Update activity |
| DELETE | `/<id>` | Cancel activity |
| POST | `/<id>/like` | Toggle like |
| POST | `/<id>/participate` | Request to join |
| GET | `/<id>/participants` | List participants |
| PUT | `/<id>/participants/<user_id>` | Accept/reject |

### Friends (`/api/friends`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List friends |
| GET | `/requests/sent` | Sent requests |
| POST | `/request/<user_id>` | Send request |
| POST | `/request/<id>/accept` | Accept request |
| POST | `/request/<id>/reject` | Reject request |
| DELETE | `/<friend_id>` | Remove friend |
| POST | `/block/<user_id>` | Block user |

### Messages (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List conversations |
| GET | `/conversation/<user_id>` | Get messages |
| POST | `/send` | Send message |
| POST | `/<id>/read` | Mark as read |
| GET | `/unread/count` | Unread count |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications |
| GET | `/unread/count` | Unread count |
| POST | `/<id>/read` | Mark as read |
| POST | `/read-all` | Mark all as read |
| DELETE | `/<id>` | Delete notification |

## Authentication

The API uses JWT tokens. Include in headers:
```
Authorization: Bearer <access_token>
```

## Testing

```bash
# run all tests with coverage
flask test

# run specific test file
pytest tests/test_auth.py -v

# run with coverage report
pytest --cov=app tests/
```

## Development

```bash
# format code
flask lint

# seed database with test data
flask seed

# reset database (careful!)
flask reset-db

# interactive shell with context
flask shell
```

## Deployment

### Heroku / Railway / Render
```bash
# uses Procfile
git push heroku main
```

### Docker
```bash
docker-compose -f docker-compose.yml up -d
```

### Manual
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
```

## License

All rights reserved. This is a private project.
