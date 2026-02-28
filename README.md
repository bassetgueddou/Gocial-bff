# Gocial

## What's inside

```
gocial/
├── GocialBackend/          # REST API — Flask, SQLAlchemy, JWT
│   ├── app/
│   │   ├── models/         # DB models (User, Activity, Message…)
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # auth helpers, email
│   ├── migrations/         # Alembic
│   ├── tests/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── GocialFrontMobile/      # Mobile app — React Native, TypeScript
│   ├── src/
│   │   ├── services/       # API layer (axios, JWT refresh)
│   │   ├── contexts/       # AuthContext
│   │   ├── hooks/          # useActivities, useFriends…
│   │   └── types/          # TS interfaces
│   ├── screens/            # all the UI
│   ├── navigation/
│   └── Dockerfile          # for CI only
│
├── docker-compose.yml      # runs everything (API + Postgres + Redis)
└── .gitignore
```

## Tech

- **Backend**: Python 3.11 · Flask 3 · SQLAlchemy 2 · JWT · Alembic
- **Frontend**: React Native 0.78 · React 19 · TypeScript · NativeWind · React Navigation 7
- **DB**: SQLite locally, Postgres in Docker/prod
- **Infra**: Docker, Redis, Gunicorn

## Get it running

### Backend (no Docker)

```bash
cd GocialBackend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
flask db upgrade
flask run
```

API on `http://localhost:5000`. Hit `/api/health` to check.

### Backend (Docker)

```bash
docker-compose up --build
```

That spins up the API (`:5000`), Postgres (`:5432`), Redis (`:6379`), and Adminer (`:8080`).

### Frontend

```bash
cd GocialFrontMobile
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

Android emulators can't reach `localhost` directly so the app auto-uses `10.0.2.2:5000`. For a physical device, update the IP in `src/config.ts`.

## API overview

All routes under `/api`. Auth via `Authorization: Bearer <token>`.

| Area | Prefix | Key routes |
|------|--------|-----------|
| Auth | `/auth` | register, login, refresh, me, change-password |
| Users | `/users` | get profile, update, avatar upload, search |
| Activities | `/activities` | CRUD, like, participate, top 3 |
| Friends | `/friends` | request, accept, reject, block, list |
| Messages | `/messages` | conversations, send, read, unread count |
| Notifications | `/notifications` | list, mark read, delete |

## CLI

```bash
flask test           # tests + coverage
flask lint           # black + isort + flake8
flask seed           # fill DB with sample data
flask reset-db       # nuke and rebuild tables
flask create-admin   # interactive admin creation
```

## Auth flow

1. User registers or logs in → gets `access_token` + `refresh_token`
2. Every API request sends `Bearer <access_token>`
3. When access token expires, the axios interceptor auto-calls `/auth/refresh` with the refresh token
4. If refresh fails → user gets logged out

All handled in `src/services/api.ts`, no manual token management needed in screens.

## Git

Single repo, one `git clone` gets you everything. The `.gitignore` covers Python stuff (`.venv/`, `__pycache__/`, `.db`), Node (`node_modules/`), build artifacts, IDE files, env files.

## Deploy

**Backend**: Procfile included for Heroku/Railway/Render, or just `docker-compose up -d`, or raw `gunicorn`.

**Frontend**: `./gradlew assembleRelease` for Android APK, Xcode Archive for iOS.

## License

All rights reserved. Private project.
