# Gocial

Réseau social mobile autour des activités (sport, sorties, culture, visio).

## Structure

```
gocial/
├── GocialBackend/          # REST API — Flask, SQLAlchemy, JWT
│   ├── app/
│   │   ├── models/         # DB models (User, Activity, Message…)
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # auth helpers, email
│   ├── migrations/         # Alembic
│   ├── tests/
│   └── Dockerfile
│
├── GocialFrontMobile/      # Mobile app — React Native, TypeScript
│   ├── src/
│   │   ├── services/       # API layer (axios, JWT refresh)
│   │   ├── contexts/       # AuthContext
│   │   ├── hooks/          # useActivities, useFriends…
│   │   └── types/          # TS interfaces
│   ├── screens/            # all the UI
│   └── navigation/
│
├── docker-compose.yml      # runs everything (API + Postgres + Redis + Adminer)
└── .gitignore
```

## Tech

- **Backend** : Python 3.11 · Flask 3 · SQLAlchemy 2 · JWT · Alembic
- **Frontend** : React Native 0.78 · React 19 · TypeScript · NativeWind · React Navigation 7
- **DB** : SQLite localement, PostgreSQL en Docker/prod
- **Infra** : Docker, Redis, Gunicorn

---

## Démarrage rapide (Docker — recommandé)

### 1. Lancer les services

```bash
docker-compose up --build -d
```

Ça démarre :
| Service | Port | Description |
|---------|------|-------------|
| API Flask | `:5000` | Backend REST |
| PostgreSQL | `:5432` | Base de données |
| Redis | `:6379` | Cache & rate limiting |
| Adminer | `:8080` | Interface BDD (dev) |

### 2. Créer les tables (migration)

```bash
docker-compose exec api flask db upgrade
```

> **Important** : Cette commande est **obligatoire** après chaque `docker-compose down -v` (qui supprime les volumes et donc la BDD), ou après un premier lancement.

### 3. Remplir avec des données de test (optionnel)

```bash
docker-compose exec api flask seed
```

### 4. Vérifier que l'API tourne

```bash
curl http://localhost:5000/api/health
```

Ou ouvrir `http://localhost:5000/api/health` dans le navigateur.

### 5. Lancer le frontend mobile

```bash
cd GocialFrontMobile
yarn install
npx react-native run-android    # Android
npx react-native run-ios        # iOS
```

> L'émulateur Android ne peut pas accéder à `localhost` directement — l'app utilise `10.0.2.2:5000` automatiquement. Pour un appareil physique, modifier l'IP dans `src/config.ts`.

---

## Démarrage sans Docker

### Backend

```bash
cd GocialBackend
python -m venv venv
venv\Scripts\activate            # Windows
source venv/bin/activate         # Mac/Linux
pip install -r requirements.txt
flask db upgrade                 # Créer les tables
flask seed                       # Données de test (optionnel)
flask run                        # Serveur sur :5000
```

### Frontend

```bash
cd GocialFrontMobile
yarn install
npx react-native run-android
```

---

## Commandes utiles

### Backend (dans le container Docker)

```bash
docker-compose exec api flask db upgrade          # Appliquer les migrations
docker-compose exec api flask db migrate -m "msg" # Créer une nouvelle migration
docker-compose exec api flask seed                 # Remplir la BDD de données de test
docker-compose exec api flask reset-db             # Supprimer et recréer les tables
docker-compose exec api flask test                 # Lancer les tests
docker-compose exec api flask lint                 # Format (black + flake8)
docker-compose exec api flask create-admin         # Créer un admin
```

### Backend (sans Docker, avec le venv Windows)

```bash
cd GocialBackend
../.venv/Scripts/python.exe -m flask db upgrade
../.venv/Scripts/python.exe -m flask seed
../.venv/Scripts/python.exe -m flask run
../.venv/Scripts/python.exe -m flask test
```

### Frontend

```bash
cd GocialFrontMobile
npx tsc --noEmit                 # Vérification TypeScript (doit être 0 erreurs)
yarn web                         # Version web (Vite)
npx react-native run-android     # Lancer sur Android
npx react-native run-ios         # Lancer sur iOS
npx react-native start --reset-cache #metro
```

### Docker

```bash
docker-compose up -d             # Démarrer en arrière-plan
docker-compose up --build -d     # Rebuild après changement backend
docker-compose down              # Arrêter les services
docker-compose down -v           # Arrêter + SUPPRIMER les volumes (BDD vidée !)
docker-compose logs -f api       # Voir les logs de l'API en temps réel
```

> **Attention** : `docker-compose down -v` supprime les volumes PostgreSQL. Il faudra refaire `flask db upgrade` + `flask seed` après.

---

## Workflow après un reset complet

Si tu as fait `docker-compose down -v` ou si tu repars de zéro :

```bash
# 1. Lancer les services
docker-compose up --build -d

# 2. Attendre que Postgres soit prêt (~5s)
docker-compose logs db | tail -5

# 3. Créer les tables
docker-compose exec api flask db upgrade

# 4. (Optionnel) Remplir de données de test
docker-compose exec api flask seed

# 5. Lancer le frontend
cd GocialFrontMobile && npx react-native run-android
```

---

## API overview

Toutes les routes sous `/api`. Auth via `Authorization: Bearer <token>`.

| Domaine | Préfixe | Routes principales |
|---------|---------|-------------------|
| Auth | `/auth` | register, login, refresh, me, change-password |
| Users | `/users` | profil, update, avatar, search |
| Activities | `/activities` | CRUD, like, participate, top 3 |
|
 Friends | `/friends` | request, accept, reject, block, list |
| Messages | `/messages` | conversations, send, read, unread count |
| Notifications | `/notifications` | list, mark read, delete |

## Flux d'auth

1. L'utilisateur s'inscrit ou se connecte → reçoit `access_token` + `refresh_token`
2. Chaque requête API envoie `Bearer <access_token>`
3. Quand le token expire, l'intercepteur axios appelle `/auth/refresh` automatiquement
4. Si le refresh échoue → déconnexion

Géré dans `src/services/api.ts`, pas de gestion manuelle des tokens dans les écrans.

## Adminer (interface BDD)

Accessible sur `http://localhost:8080` quand Docker tourne.

| Champ | Valeur |
|-------|--------|
| Système | PostgreSQL |
| Serveur | `db` |
| Utilisateur | `gocial` |
| Mot de passe | `gocial` |
| Base de données | `gocial` |

emulator:
"$LOCALAPPDATA/Android/Sdk/emulator/emulator" -avd Pixel_6a &
## License

All rights reserved. Private project.
