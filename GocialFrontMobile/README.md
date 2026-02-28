# Gocial

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18 | https://nodejs.org |
| Python | >= 3.10 | https://python.org |
| Xcode | >= 15 | Mac App Store |
| CocoaPods | latest | `sudo gem install cocoapods` |
| Android Studio | latest | https://developer.android.com/studio |
| Git | latest | https://git-scm.com |

> **iOS builds require macOS with Xcode installed.**

Follow the full React Native environment setup: https://reactnative.dev/docs/set-up-your-environment

---

## 1. Clone

```sh
git clone https://github.com/bassetgueddou/Gocial-bff.git
cd Gocial-bff
```

---

## 2. Backend Setup

```sh
cd GocialBackend

# Create virtual environment
python3 -m venv .venv

# Activate it
# macOS / Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and set your own SECRET_KEY and JWT_SECRET_KEY

# Initialize database
flask db upgrade

# (Optional) Seed test data
flask seed

# Start backend
flask run
```

Backend runs on **http://localhost:5000**

---

## 3. Frontend Setup

```sh
cd GocialFrontMobile

# Install JS dependencies
npm install --legacy-peer-deps
```

---

## 4. Run on iOS (macOS only)

```sh
# Install CocoaPods dependencies (first time or after native dep changes)
cd ios
bundle install
bundle exec pod install
cd ..

# Start Metro bundler (in a separate terminal)
npm start

# Build and run on iOS Simulator
npm run ios
```

**Troubleshooting iOS:**
- If `pod install` fails, try `cd ios && pod install --repo-update`
- If build fails in Xcode, open `ios/GocialFrontMobile.xcworkspace` (not `.xcodeproj`), select a simulator, and hit Run
- To run on a physical device, you need an Apple Developer account and must set the signing team in Xcode

---

## 5. Run on Android

```sh
# Start Metro bundler (if not already running)
npm start

# Build and run on Android Emulator
npm run android
```

> Make sure an Android emulator is running or a device is connected (`adb devices` to check).

---

## 6. Run on Web (experimental)

```sh
npm run web
```

Opens on **http://localhost:3000**

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Build & run on iOS |
| `npm run android` | Build & run on Android |
| `npm run web` | Start Vite dev server (web) |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
Gocial-bff/
├── GocialBackend/          # Flask API
│   ├── app/                # Routes, models, services
│   ├── migrations/         # DB migrations (Alembic)
│   ├── tests/              # Backend tests
│   ├── run.py              # Entry point
│   └── requirements.txt
│
└── GocialFrontMobile/      # React Native app
    ├── screens/            # All screens
    ├── navigation/         # React Navigation config
    ├── src/
    │   ├── contexts/       # Auth context
    │   ├── hooks/          # Custom hooks
    │   ├── services/       # API service (Axios)
    │   └── types/          # TypeScript types
    ├── App.tsx             # Root component
    └── index.js            # Entry point
```

---

## Environment Variables

### Backend (`GocialBackend/.env`)

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Flask secret key |
| `JWT_SECRET_KEY` | Yes | JWT signing key |
| `DATABASE_URL` | Yes | DB connection string (default: SQLite) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `MAIL_USERNAME` | No | Email for notifications |
| `MAIL_PASSWORD` | No | Email app password |

### Frontend

The API URL is configured in `src/services/api.ts`.
- **Android emulator:** uses `10.0.2.2:5000` (maps to host localhost)
- **iOS simulator:** uses `localhost:5000`

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `pod install` fails | `cd ios && pod install --repo-update` |
| Metro cache issues | `npx react-native start --reset-cache` |
| Android build fails | `cd android && ./gradlew clean` then rebuild |
| Port 8081 in use | `lsof -ti:8081 | xargs kill -9` (macOS/Linux) |
| White screen on app | Check Metro terminal for errors, reload with R |
| AsyncStorage error on Android | Run `cd android && ./gradlew clean` and rebuild |
