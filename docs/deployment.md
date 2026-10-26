---
title: Deployment
description: Where each part of Canopy runs, how it is configured, and how releases, monitoring and recovery work.
status: Verified
---

# Deployment

This page explains where each part of Canopy runs, how it is configured, how a change gets from a pull request to production, and how to check, monitor and recover the system.

Canopy has four deployable parts. They are released separately, but they depend on each other: the web portal and the mobile app both call the same backend API.

## 1. What runs where

| Part                   | Technology              | Hosted on                                              | Deploys when                                                             | Details                        |
| ---------------------- | ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------ |
| **Backend API**        | FastAPI (Python 3.11+)  | Heroku                                                 | A pull request is merged into `main` of `solene-backend`                 | [Backend](/backend)            |
| **Database**           | PostgreSQL with PostGIS | Heroku Postgres add-on, with a backup copy on Supabase | Schema changes run automatically on each backend release                 | [Backend §4](/backend)         |
| **Web portal**         | Next.js                 | _To confirm: hosting platform and URL_                 | _To confirm_                                                             | [Web App](/frontend-web)       |
| **Mobile app**         | Flutter                 | Installed on trackers' phones (Android APK)            | A new release build is shared with trackers                              | [Mobile App](/frontend-mobile) |
| **Documentation site** | VitePress               | GitHub Pages                                           | A pull request is merged into `main` of `solene-technical-documentation` | This site                      |

### External services

The backend is the only part that talks to outside services. Each one is optional at start-up: if it is not configured, its feature returns 503 or is skipped, and the rest of the API keeps working.

| Service                     | Used for                                                     | Configured by                                                           |
| --------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Upstash Redis               | Login codes, lockouts, rate limits, forgot-password cooldown | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                    |
| SMTP provider               | Invites, login codes, password links                         | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` |
| Firebase Cloud Messaging    | Push notifications                                           | `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON`                            |
| Google Gemini + File Search | AI predictions and chatbot                                   | `GEMINI_API_KEY`, `GEMINI_FILE_SEARCH_STORE`                            |
| Open-Meteo                  | Weather per grid cell                                        | No key needed                                                           |
| MapTiler                    | Satellite map tiles in the web portal                        | `NEXT_PUBLIC_MAPTILER_KEY` (web portal)                                 |

### How the parts connect

1. The **mobile app** calls the backend directly over HTTPS. Its API address is built into the app at compile time (`API_URL`), and defaults to the hosted backend.
2. The **web portal**'s browser code never calls the backend directly. Its Next.js server receives the request, adds the user's token from the `canopy_session` cookie, and forwards it to the backend at `CANOPY_API_URL`.
3. The **backend** reads and writes the **database** and calls the external services.
4. A **scheduled job** on Heroku runs every 10 minutes to send reminders and push notifications.

## 2. Environments

|                                                   | Local development                                                               | Production                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Backend URL**                                   | `http://localhost:8000`                                                         | Heroku app URL (the mobile app's default is `https://canopyy-dfadcbf323a2.herokuapp.com`) |
| **Database**                                      | SQLite (`sqlite:///./canopy.db`) by default, or a local PostgreSQL with PostGIS | Heroku Postgres with PostGIS                                                              |
| **Settings come from**                            | A `.env` file, loaded by `python-dotenv`                                        | Heroku config vars                                                                        |
| **API docs (`/docs`, `/redoc`, `/openapi.json`)** | On                                                                              | Off when `ENVIRONMENT=production`                                                         |
| **CORS**                                          | Local web URLs, e.g. `http://localhost:3000`                                    | Only the deployed web portal URL                                                          |
| **Email**                                         | Optional; without SMTP, invites cannot be sent                                  | SMTP configured                                                                           |
| **Push**                                          | Off unless FCM is configured                                                    | FCM configured                                                                            |
| **Test tracker accounts** (`OTP_BYPASS_EMAILS`)   | May be used for testing                                                         | Must be empty                                                                             |

There is no separate staging environment at the moment. Changes are checked locally and in pull request review before they reach `main`.

## 3. Environment variables

Only variable **names** are listed. Values live in `.env` locally and in Heroku config vars in production, and are never committed to Git.

### Backend

| Variable                                                                    | Required                                 | Purpose                                                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                              | Yes in production                        | Database connection. `postgres://` is rewritten to `postgresql://`. Defaults to SQLite locally |
| `SECRET_KEY`                                                                | **Yes** (the app won't start without it) | Signs tokens and hashes login codes. At least 32 characters                                    |
| `ENVIRONMENT`                                                               | Yes in production                        | Set to `production` to turn off the public API docs                                            |
| `ALLOWED_ORIGINS`                                                           | Yes for the web portal                   | Comma-separated list of web portal URLs allowed by CORS                                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES`                                               | No (default 30)                          | Access token lifetime                                                                          |
| `PASSWORD_LINK_EXPIRE_HOURS`                                                | No (default 1)                           | Invite and reset link lifetime                                                                 |
| `FRONTEND_URL`                                                              | Recommended                              | Builds the set-password and reset links in emails                                              |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                        | Yes for login                            | Login codes, lockouts and rate limits                                                          |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`     | Yes for email                            | Outgoing email                                                                                 |
| `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON`                                | For push                                 | Firebase push notifications                                                                    |
| `GEMINI_API_KEY`, `GEMINI_FILE_SEARCH_STORE`                                | For AI                                   | AI predictions and chatbot                                                                     |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODELS`, `AI_REQUESTS_PER_MINUTE`          | No                                       | AI model choice and rate limit                                                                 |
| `ADMIN_INVITE_KEY`                                                          | Only to create the first admin           | Enables `POST /auth/invite-admin`; leave unset afterwards                                      |
| `OTP_BYPASS_EMAILS`                                                         | No, keep empty in production             | Test tracker accounts only                                                                     |
| `MAX_BODY_BYTES`, `MAX_UPLOAD_BYTES`                                        | No                                       | Override the 1 MB JSON and 12 MB upload limits                                                 |
| `NOTIFICATION_TIMEZONE`, `DUE_REMINDER_HOUR`, `NOTIFICATION_RETENTION_DAYS` | No                                       | Reminder timing and clean-up                                                                   |

The full list with defaults is in [Backend §3](/backend), [Security](/security) and [AI Module §3](/ai).

### Web portal

| Variable                   | Required    | Purpose                                                                                                                 |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CANOPY_API_URL`           | **Yes**     | Backend URL the Next.js server forwards requests to. The portal stops with "CANOPY_API_URL is not set" if it is missing |
| `NEXT_PUBLIC_MAPTILER_KEY` | For the map | MapTiler key for satellite tiles. Without it, the map is blank                                                          |

### Mobile app

| Variable  | How it is set                              | Purpose                                            |
| --------- | ------------------------------------------ | -------------------------------------------------- |
| `API_URL` | At build time: `--dart-define=API_URL=...` | Backend URL. Defaults to the hosted Heroku backend |

## 4. Backend: build and release

### How Heroku runs the backend

The `Procfile` in `solene-backend` tells Heroku what to do:

```text
release: alembic upgrade head
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

- **`release`** runs once on every deploy, **before** the new version starts. It applies any new database migrations, so migrations do not need to be run by hand.
- **`web`** starts the API with Uvicorn on the port Heroku provides.

If the `release` step fails (for example, a migration error), Heroku does not start the new version and keeps the previous one running.

### Release steps

1. **Work on a branch.** `feature/<name>`, opened as a pull request into `develop`.
2. **Before opening the pull request**, these must pass locally:
   ```bash
   uv run ruff check .
   uv run pytest -q
   alembic heads          # must print exactly one revision
   ```
   No `.env`, service-account JSON or local database files may be staged.
3. **Review and merge** into `develop`.
4. **Release** by opening a pull request from `develop` into `main`. When it is merged, Heroku builds and deploys automatically.
5. **Check new config vars.** If the release needs a new environment variable, set it before or immediately after the deploy:
   ```bash
   heroku config -a <app-name>
   heroku config:set NEW_VARIABLE=value -a <app-name>
   ```
6. **Verify** the deploy (see [Health checks](#_7-health-checks)).

### Add-ons and scheduled jobs

| Item                           | Purpose                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heroku Postgres (with PostGIS) | Main database (`DATABASE_URL`)                                                                                                                                              |
| Heroku Scheduler               | Runs `python -m jobs.notifications` every 10 minutes: creates due and overdue reminders, sends pending pushes, expires old pushes, deletes notifications older than 90 days |

Other jobs are run by hand when needed:

| Command                                                        | When                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `heroku run python -m jobs.sync_reference_files -a <app-name>` | After adding, replacing or removing an AI reference paper. Exits with code 1 if any upload fails |
| `POST /api/v1/environmental-data/collect` (admin)              | To collect weather data. There is no daily schedule yet                                          |

### First-time setup of a new environment

1. Create the Heroku app and add Heroku Postgres. Enable the PostGIS extension.
2. Set every required config var from [section 3](#_3-environment-variables).
3. Deploy `main`. The `release` step creates the schema.
4. Set `ADMIN_INVITE_KEY` temporarily and call `POST /auth/invite-admin` to create the first administrator. Then unset the key.
5. Run `python -m jobs.sync_reference_files` to load the AI reference library.
6. Add the Heroku Scheduler job for `python -m jobs.notifications`.

## 5. Web portal: build and release

```bash
npm ci
npm run build
npm start
```

Set `CANOPY_API_URL` and `NEXT_PUBLIC_MAPTILER_KEY` in the hosting platform before building. `NEXT_PUBLIC_` variables are built into the browser code, so changing them requires a new build.

After deploying, add the portal's URL to the backend's `ALLOWED_ORIGINS` and use it as `FRONTEND_URL`, so CORS and email links work.

> **To confirm:** the hosting platform, production URL and whether it deploys automatically from `main`.

## 6. Mobile app: build and release

Build a release APK pointed at the production backend:

```bash
flutter build apk --release --dart-define=API_URL=https://canopyy-dfadcbf323a2.herokuapp.com
```

The APK is written to `build/app/outputs/flutter-apk/app-release.apk`.

`ObservationService` and `GridService` have their own default address, so when pointing the app at a **different** server, check that both use the same `API_URL`. See [Mobile App §8.3](/frontend-mobile).

> **To confirm:** how release builds are signed and shared with trackers (direct APK, Play Store or another channel).

## 7. Health checks

After every backend deploy:

```bash
curl -i https://<backend-url>/health
```

| Check                       | Expected                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| `GET /health`               | `200` with `{"status":"ok"}`                                          |
| `GET /docs` in production   | `404` (API docs are hidden)                                           |
| Sign in from the web portal | Login code email arrives and sign-in succeeds (checks SMTP and Redis) |
| Open the map                | Satellite tiles load (checks the MapTiler key)                        |
| Mobile app sign-in          | Succeeds against the production backend                               |

`/health` only confirms the API process is running. It does not check the database, Redis or other services, so also do a real sign-in after each release.

## 8. Logging and monitoring

| What               | Where                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Backend logs       | `heroku logs --tail -a <app-name>`                                                                                            |
| Unexpected errors  | Logged with an `error_id`. The client receives the same `error_id`, so a user can quote it and support can find the log entry |
| Audit trail        | Platform-wide audit log with a hash chain (see [Security](/security))                                                         |
| Scheduled job runs | Heroku Scheduler dashboard and `heroku logs`                                                                                  |
| Web portal logs    | _To confirm: hosting platform logs_                                                                                           |

There is no automated monitoring or alerting yet. Uptime checks, error tracking and a SIEM are planned (see [Security](/security)).

## 9. Rollback and recovery

| Situation                               | What to do                                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A backend release is broken             | `heroku releases -a <app-name>`, then `heroku releases:rollback vNN -a <app-name>` to return to the last good version                               |
| The broken release included a migration | Rolling back the code does **not** undo the migration. Write a new migration that reverses it, or restore the database from backup                  |
| Data is lost or corrupted               | Restore from the Supabase backup (see [Security](/security))                                                                                        |
| A secret leaked                         | Revoke it in its provider's console, set a new value with `heroku config:set`, and redeploy. If `SECRET_KEY` changes, every user must sign in again |
| A mobile release is broken              | Share the previous APK again with trackers                                                                                                          |

## 10. Known limitations

| Limitation                            | Effect                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Heroku cuts any request at 30 seconds | A slow AI answer can time out in the browser even though the backend finishes and saves it (see [AI Module](/ai)) |
| No staging environment                | Releases go straight from review to production                                                                    |
| No automated monitoring or alerts     | Problems are found through logs or user reports                                                                   |
| Weather collection is manual          | Weather data is only up to date if an admin triggers collection                                                   |
| In-memory AI rate limiter             | Each server process counts separately, and counts reset on restart                                                |

## 11. Documentation site

This site is built with VitePress and deployed by GitHub Actions (`.github/workflows/deploy-docs.yml`) on every push to `main`:

1. `npm ci` installs dependencies.
2. `npm run docs:build` builds the site into `docs/.vitepress/dist`. The build fails on dead links.
3. The site is published to GitHub Pages at `https://akirachix.github.io/solene-technical-documentation/`.

GitHub Pages must be enabled for the repository (**Settings → Pages → Source → GitHub Actions**), which needs admin access.
