---
title: Backend and Data Model
description: Backend architecture, API, data model, security, tests, and operational notes.
status: review
---

# Canopy Backend & Data Model Technical Documentation

> **Evidence boundary:** The backend repository is not included in this workspace. Source paths, endpoint behavior, configuration, test results, and operational claims below are documented project evidence, not independently verified implementation facts.

## 1. Overview

The CANOPY API is a single FastAPI service that holds every Solene record (users, gorillas, observations, health cases, follow-up tasks, notifications, environmental data and disease predictions) and enforces all business rules. The Next.js web portal (vets, admin) and the Flutter app (trackers) are both thin clients of this API.

| Area              | Choice                                               | Notes                                                                                        |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Language          | Python 3.11+                                         | `requires-python = ">=3.11"` in `pyproject.toml`                                             |
| Web framework     | FastAPI                                              | App title "Canopy API", version 0.1.0; Swagger UI at `/docs` (off in production)             |
| ORM               | SQLAlchemy (declarative models)                      | Sessions per request via `database.get_db`                                                   |
| Validation        | Pydantic v2                                          | Shared base classes in `schemas/common.py`                                                   |
| Database          | PostgreSQL + PostGIS                                 | `locations.grid_dimension` is a PostGIS polygon (SRID 4326); SQLite is only a local fallback |
| Migrations        | Alembic                                              | One head; history includes merge revisions, see section 5                                    |
| Cache / OTP store | Upstash Redis (REST)                                 | Login codes, lockouts, rate limits and forgot-password cooldown                              |
| Auth              | JWT (HS256, python-jose) + Argon2 password hashing   | Email one-time code on every login                                                           |
| Email             | SMTP                                                 | Invites, login codes, password links                                                         |
| Push              | Firebase Cloud Messaging HTTP v1                     | Via a Google service account                                                                 |
| Weather           | Open-Meteo API                                       | Daily temperature, rainfall, humidity per grid cell                                          |
| AI                | Google Gemini with File Search                       | Risk predictions and chatbot, see the AI section                                             |
| Tooling           | `uv` (dependencies), `ruff` (lint), `pytest` (tests) |                                                                                              |
| Hosting           | Heroku                                               | Auto-deploys from `main`                                                                     |

Health check: `GET /health` returns `{"status": "ok"}`. The mobile app calls it (8-second timeout) to decide whether the phone is online, so it must stay public, fast and free of database work.

## 2. Architecture

Every request passes through the same five layers, and each layer has one job. Routers never hold business rules, and only services and repositories touch the database.

Web and mobile requests carry a Bearer JWT. The scheduled job calls the same services. Outside services are reached only from the service layer.

- **Router** (`routers/`): declares the HTTP path, query and body parameters, and which role may call it (FastAPI dependencies).
- **Schema** (`schemas/`): Pydantic models that validate the request and shape the response. Create and update schemas reject unknown fields (`StrictModel`, `extra="forbid"`).
- **Service** (`services/`): business rules and workflow, such as status transitions, ownership checks, case numbering and notifications.
- **Repository** (`repositories/`): SQLAlchemy queries and commits.
- **Model** (`models/`): table definitions, constraints and relationships.

Cross-cutting pieces live in `core/` (config, security, auth dependencies, Redis), `integrations/` (SMTP, Open-Meteo, FCM push, HTTP helper) and `jobs/` (scheduled work).

| Folder                  | Contents                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `main.py`               | Creates the app, CORS middleware, registers every router                                                                                |
| `database.py`           | Engine, `SessionLocal`, `Base`, `get_db()` dependency                                                                                   |
| `core/config.py`        | `SECRET_KEY`, token lifetimes, lockout limits, FCM settings, `require_env()`                                                            |
| `core/security.py`      | Argon2 hashing, JWT access tokens, single-use password-link tokens                                                                      |
| `core/dependencies.py`  | `get_authenticated_user`, `get_current_user`, `require_roles(...)`                                                                      |
| `core/redis_client.py`  | Upstash Redis client; returns 503 when Redis is not configured                                                                          |
| `models/`               | One file per table + `enums.py`                                                                                                         |
| `schemas/`              | One file per resource + `common.py` (`Page`, `StrictModel`, `PatchModel`, UTC helpers)                                                  |
| `repositories/`         | One repository per resource                                                                                                             |
| `services/`             | One service per resource + shared helpers (`numbering.py`, `observation_review.py`, `case_context.py`, `errors.py`, `push_delivery.py`) |
| `routers/`              | One router per resource                                                                                                                 |
| `integrations/`         | `email.py`, `open_meteo.py`, `push.py`, `http.py`                                                                                       |
| `jobs/notifications.py` | Scheduled reminder, push and clean-up job                                                                                               |
| `alembic/versions/`     | Database migrations                                                                                                                     |
| `tests/`                | pytest suite                                                                                                                            |

### One request through the layers

Opening a health case shows the split. The router only declares the path, the body schema and the role, then hands over to the service, which holds every rule.

`routers/health_case_router.py`

```python
router = APIRouter(prefix="/api/v1/health-cases", tags=["Health Cases"])

can_read = require_role(*HEALTH_READERS)
can_write = require_role(*DOCTOR)


@router.post("", response_model=HealthCaseRead, status_code=status.HTTP_201_CREATED)
def open_case(
    data: HealthCaseCreate,
    user: CurrentUser = Depends(can_write),
    db: Session = Depends(get_db),
):
    return HealthCaseService(db, user).create(data)
```

`services/health_case_service.py`

```python
def create(self, data: HealthCaseCreate) -> HealthCaseRead:
    if GorillaRepository(self.db).get(data.gorilla_id) is None:
        raise bad_request("Unknown gorilla_id: no such gorilla is registered.")
    vet_id = data.user_id or self.user.user_id
    self._check_vet(vet_id)
    case = HealthCase(
        case_id=uuid.uuid4(),
        gorilla_id=data.gorilla_id,
        user_id=vet_id,
        priority=data.priority,
        status=CaseStatus.new,
        assessment=data.assessment,
        diagnosis=data.diagnosis,
        treatment=data.treatment,
        vet_notes=data.vet_notes,
        opened_at=datetime.now(UTC),
    )

    def assign():
        case.case_number = next_number(
            self.db, HealthCase.case_number, case_prefix(case.opened_at)
        )

    save_with_number(self.db, assign, lambda: self.db.add(case))
    return self.get(case.case_id)


def _check_vet(self, user_id: uuid.UUID) -> None:
    vet = UserRepository(self.db).get(user_id)
    if vet is None or vet.role != UserRole.gorilla_doctor or not vet.is_active:
        raise bad_request("A case must be assigned to an active gorilla doctor.")
```

## 3. Configuration

All settings come from environment variables: `.env` locally (loaded by `python-dotenv`) and config vars on Heroku. Secrets are never committed. Only the variable names are listed here.

| Variable                                                                          | Required              | Default                      | Used for                                                                           |
| --------------------------------------------------------------------------------- | --------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                    | Yes in production     | `sqlite:///./canopy.db`      | Database connection; `postgres://` is rewritten to `postgresql://`                 |
| `SECRET_KEY`                                                                      | Yes (app won't start) | none, must be 32+ chars      | Signs JWTs and hashes login codes                                                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES`                                                     | No                    | 30                           | Access token lifetime                                                              |
| `PASSWORD_LINK_EXPIRE_HOURS`                                                      | No                    | 1                            | Invite / reset link lifetime                                                       |
| `ALLOWED_ORIGINS`                                                                 | Yes for browsers      | empty                        | Comma-separated list of allowed web origins                                        |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                              | Yes for login         | none                         | OTP codes, forgot-password cooldown                                                |
| `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`                        | Yes for email         | none                         | Sending invites, login codes, resets                                               |
| `SMTP_PORT`                                                                       | No                    | 587                          | 465 = implicit TLS, otherwise STARTTLS                                             |
| `FRONTEND_URL`                                                                    | Recommended           | none                         | Builds the set-password / reset links; without it, emails contain a raw setup code |
| `ADMIN_INVITE_KEY`                                                                | Only to bootstrap     | none                         | Header key for `POST /auth/invite-admin`; endpoint returns 404 when unset          |
| `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON`                                      | For push              | none                         | Firebase push; JSON may be raw or base64. Push is off when missing                 |
| `FCM_SCOPE`, `FCM_URL`, `FCM_TIMEOUT_SECONDS`, `FCM_TOKEN_REFRESH_MARGIN_SECONDS` | No                    | Google defaults, 10 s, 300 s | FCM client tuning                                                                  |
| `NOTIFICATION_TIMEZONE`                                                           | No                    | `Africa/Kigali`              | When "due today" starts                                                            |
| `DUE_REMINDER_HOUR`                                                               | No                    | 6                            | Hour (local) from which due-today reminders are created                            |
| `NOTIFICATION_RETENTION_DAYS`                                                     | No                    | 90                           | Age at which notifications are deleted                                             |
| `GEMINI_API_KEY`, `GEMINI_FILE_SEARCH_STORE`                                      | For AI                | none                         | Gemini key and File Search store; AI endpoints return 503 without them             |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODELS`                                          | No                    | see AI section               | Main model and comma-separated fallbacks                                           |
| `AI_REQUESTS_PER_MINUTE`                                                          | No                    | 10                           | Per-user limit shared by both AI endpoints                                         |

Fixed in code (`core/config.py`): JWT algorithm HS256, 5 failed logins trigger a 15-minute lockout, and an IP address is limited for 15 minutes after repeated failures (`LOCKOUT_MINUTES`, `IP_LOCKOUT_MINUTES`). Lockout counters are stored in Redis, so they survive restarts and are shared by every worker (see [Security](/security)). Login codes are 6 digits, valid 5 minutes, with 5 attempts (`services/auth_service.py`).

## 4. Data model

The main tables are listed below. Every primary key is a UUID generated by the app (`uuid4`), and every timestamp is stored with a time zone and handled as UTC.

### 4.1 Tables

| Table                           | Purpose                                               | Key fields                                                                                                                                                                                            | Constraints and indexes                                                                                                 |
| ------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `users`                         | Everyone who signs in                                 | `user_id`, `first_name`, `last_name`, `role`, `email`, `phone`, `password_hash`, `is_active`, `must_change_password`, `created_at`, `last_login_at`                                                   | `email` unique, `phone` unique                                                                                          |
| `gorillas`                      | The gorilla registry                                  | `gorilla_id`, `user_id` (registered by), `group_name`, `name`, `sex`, `birth_date`, `age_category`, `status`, `created_at`                                                                            | Unique (`group_name`, `name`)                                                                                           |
| `gorilla_groups`                | Family groups, editable without a deploy              | `group_id`, `name`, `is_active`, `created_at`                                                                                                                                                         | `name` unique, case-insensitive unique index on `lower(name)`                                                           |
| `locations`                     | Map grid cells                                        | `grid_id`, `grid_name`, `grid_dimension` (PostGIS POLYGON, SRID 4326), `latitude`, `longitude`                                                                                                        |                                                                                                                         |
| `observations`                  | One field sign seen by a tracker                      | `observation_id`, `gorilla_id?`, `group_name?`, `user_id` (tracker), `grid_id`, `case_id?`, `image_id?`, `symptom_category`, `symptom_name`, `severity`, `notes`, `flagged_for_vet`, `observed_at`    | CHECK: `gorilla_id` or `group_name` must be set                                                                         |
| `observation_images`            | Photo evidence, stored in the database                | `image_id`, `content_type`, `size_bytes`, `sha256`, `data` (bytes, loaded lazily), `uploaded_at`                                                                                                      | JPEG/PNG only, 5 MB max (checked in service)                                                                            |
| `health_cases`                  | A veterinary case for one gorilla                     | `case_id`, `case_number`, `gorilla_id`, `user_id` (responsible vet), `priority`, `status`, `assessment`, `diagnosis`, `treatment`, `vet_notes`, `opened_at`, `closed_at`, `outcome`, `closure_reason` | `case_number` unique (format C-YYYY-0001)                                                                               |
| `follow_up_tasks`               | Work a vet sends to a tracker                         | `task_id`, `case_id?`, `title`, `description`, `assigned_to` (tracker), `assigned_by` (vet), `due_date`, `status`, `outcome`, `created_at`, `completed_at`                                            |                                                                                                                         |
| `notifications`                 | In-app inbox rows; push is sent from these            | `notification_id`, `recipient_id`, `event_type`, `category`, `title`, `body`, `case_id?`, `task_id?`, `dedupe_key`, `push_status`, `push_attempts`, `push_attempted_at`, `read_at`, `created_at`      | `dedupe_key` unique; indexes (`recipient_id`, `created_at`), (`recipient_id`, `read_at`), (`push_status`, `created_at`) |
| `device_tokens`                 | FCM tokens per signed-in device                       | `token_id`, `user_id`, `token`, `platform`, `created_at`, `last_seen_at`                                                                                                                              | `token` unique                                                                                                          |
| `environmental_data`            | Daily weather per grid cell                           | `environmental_id`, `grid_id`, `temperature`, `rainfall`, `humidity`, `recorded_at`                                                                                                                   |                                                                                                                         |
| `disease_predictions`           | AI risk output, not a diagnosis                       | `prediction_id`, `grid_id?`, `gorilla_id?`, `disease_name`, `probability` (0-1), `risk_score`, `risk_level`, `interpretation`, `generated_at`, `model_name`, `provenance`                             | CHECK: `grid_id` or `gorilla_id` must be set                                                                            |
| `preventive_recommendations`    | Actions proposed from a prediction, reviewed by a vet | `preventive_id`, `prediction_id`, `recommendation`, `status`, `vet_notes`, `reviewed_by?`, `reviewed_at`, `created_at`                                                                                |                                                                                                                         |
| `ai_reference_files`            | Source documents the AI uses                          | `file_id`, `title`, `source_path`, `file_url`, `uploaded_at`, `expires_at`, `status`                                                                                                                  |                                                                                                                         |
| `prediction_observations`       | Join: prediction to observations used                 | (`prediction_id`, `observation_id`)                                                                                                                                                                   | Composite PK, ON DELETE CASCADE both sides                                                                              |
| `prediction_environmental_data` | Join: prediction to weather readings used             | (`prediction_id`, `environmental_id`)                                                                                                                                                                 | Composite PK, ON DELETE CASCADE                                                                                         |
| `prediction_reference_files`    | Join: prediction to reference files cited             | (`prediction_id`, `file_id`)                                                                                                                                                                          | Composite PK, ON DELETE CASCADE                                                                                         |
| `audit_logs`                    | Record of updates and deletes                         | `id` (integer), `created_at`, `action` (`update` or `delete`), `table_name`, `record_id`, `actor_id`, `actor_role`, `ip`, `changes` (JSON)                                                            | Indexes on `created_at`, `table_name`, `actor_id`, and (`table_name`, `record_id`)                                      |

`?` = nullable foreign key. Primary keys are UUIDs except `audit_logs.id`, which is an integer. The AI response tables (migration `5f6c7c5086f6`) are not listed here yet.

### 4.2 Relationships

| From                  | To                                                          | Cardinality      | Meaning                                                    |
| --------------------- | ----------------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `users`               | `gorillas`                                                  | 1 to many        | Vet who registered the gorilla                             |
| `users`               | `observations`                                              | 1 to many        | Tracker who logged it                                      |
| `users`               | `health_cases`                                              | 1 to many        | Responsible vet (current only, no history)                 |
| `users`               | `follow_up_tasks`                                           | 1 to many, twice | `assigned_to` (tracker) and `assigned_by` (vet)            |
| `users`               | `notifications`, `device_tokens`                            | 1 to many        | Recipient / device owner                                   |
| `users`               | `preventive_recommendations`                                | 1 to many        | Reviewer                                                   |
| `gorillas`            | `observations`, `health_cases`, `disease_predictions`       | 1 to many        |                                                            |
| `gorilla_groups`      | `gorillas`, `observations`                                  | 1 to many        | Via `group_name`, FK ON UPDATE CASCADE so a rename follows |
| `health_cases`        | `observations`                                              | 1 to many        | An observation joins at most one case                      |
| `health_cases`        | `follow_up_tasks`, `notifications`                          | 1 to many        |                                                            |
| `follow_up_tasks`     | `notifications`                                             | 1 to many        |                                                            |
| `locations`           | `observations`, `environmental_data`, `disease_predictions` | 1 to many        |                                                            |
| `observation_images`  | `observations`                                              | 1 to many        | A batch submission shares one photo                        |
| `disease_predictions` | `preventive_recommendations`                                | 1 to many        |                                                            |
| `disease_predictions` | `observations`, `environmental_data`, `ai_reference_files`  | many to many     | Through the three join tables                              |

### 4.3 Enumerations

| Enum (DB type)          | Values                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_role`             | `admin`, `gorilla_doctor`, `gorilla_tracker`                                                                                                 |
| `gorilla_sex`           | `male`, `female`                                                                                                                             |
| `gorilla_age_category`  | `infant`, `juvenile`, `blackback`, `silverback`, `adult_female`                                                                              |
| `gorilla_status`        | `active`, `migrated`, `deceased`, `missing`                                                                                                  |
| `symptom_category`      | `respiratory`, `gastrointestinal`, `skin_or_wound_injury`, `appetite_or_feeding`, `lethargy_or_behaviour`, `other`                           |
| `observation_severity`  | `mild`, `moderate`, `severe`                                                                                                                 |
| `case_priority`         | `low`, `medium`, `high`, `critical`                                                                                                          |
| `case_status`           | `new`, `under_review`, `monitoring`, `awaiting_result`, `closed`, `reopened`                                                                 |
| `case_outcome`          | `recovered`, `treated`, `died`, `unresolved`                                                                                                 |
| `task_status`           | `issued`, `accepted`, `completed`, `cancelled`                                                                                               |
| `risk_level`            | `minimal`, `low`, `moderate`, `high`                                                                                                         |
| `recommendation_status` | `proposed`, `approved`, `rejected`                                                                                                           |
| `reference_file_status` | `active`, `expired`                                                                                                                          |
| `notification_event`    | `task_assigned`, `task_due_today`, `task_overdue`, `task_cancelled`, `task_submitted`, `task_completed`, `case_assigned`, `review_completed` |
| `notification_category` | `update`, `alert`                                                                                                                            |
| `push_status`           | `pending`, `sending`, `sent`, `not_required`, `no_device`, `failed`, `expired`                                                               |
| `device_platform`       | `android`, `ios`, `web`                                                                                                                      |

Not stored, computed per response: observation review status (`pending_review`, `under_review`, `follow_up_required`, `reviewed_no_follow_up`) and a task's `is_overdue` flag.

### 4.4 Audit log, row-level security and backup

**Audit log.** The `audit_logs` table (`models/audit_log.py`, migration `b82f26b98e55`) records every update and delete: when it happened, the action, the table and record ID, the user ID and role that made the change, their IP address, and the changed fields as JSON (`core/db_audit.py`). Password hashes are excluded from the recorded changes. Record creation is not logged, and entries are not hash-chained.

**Row-level security.** Not implemented. Ownership rules are enforced in the API services (see [Security](/security)).

**Backup.** See [Security](/security).

## 5. Migrations

Schema changes go through Alembic only. The history contains merge revisions from parallel branches, but there must always be exactly one head (`alembic heads`). The database is never dropped and recreated to fix a migration problem.

### Revisions

Full history, newest first (from `alembic history`):

| Revision              | Down revision                                  | Change                                                             |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| `b82f26b98e55` (head) | `4f2a9c71d8e3`                                 | Add `audit_logs` table                                             |
| `4f2a9c71d8e3`        | `b793ed098927`                                 | Add `gorilla_groups` table and point `group_name` columns at it    |
| `b793ed098927`        | `25435e5feaad`, `dfc8dff4b5b4`                 | Merge latest heads                                                 |
| `25435e5feaad`        | `53a0c3551c40`, `577ac3181020`, `ee776527be76` | Merge all current heads                                            |
| `53a0c3551c40`        | `f84d68e4c1fd`, `5f6c7c5086f6`                 | Merge notification and AI response heads                           |
| `dfc8dff4b5b4`        | `577ac3181020`, `ee776527be76`                 | Merge observation submission and AI heads                          |
| `ee776527be76`        | `5f6c7c5086f6`, `d5e7f9a1b3c2`                 | Merge heads                                                        |
| `f84d68e4c1fd`        | `c4d2e8f1a6b3`                                 | Add `notifications` and `device_tokens`                            |
| `577ac3181020`        | `c4d2e8f1a6b3`                                 | Add observation submission ID                                      |
| `5f6c7c5086f6`        | `c4d2e8f1a6b3`                                 | Add AI response tables                                             |
| `d5e7f9a1b3c2`        | `c4d2e8f1a6b3`                                 | Add prediction provenance                                          |
| `c4d2e8f1a6b3`        | `b7c1e2a4d9f0`                                 | Add group observations and case numbers                            |
| `b7c1e2a4d9f0`        | `38d9debffaec`                                 | Add observation images                                             |
| `38d9debffaec`        | `a93b9680f1bd`, `e99b8c8953f4`                 | Merge follow-up and gorilla heads                                  |
| `a93b9680f1bd`        | `8c1f4e2a9b7d`                                 | Add `cancelled` to task status                                     |
| `e99b8c8953f4`        | `8c1f4e2a9b7d`                                 | User invites, gorilla group name                                   |
| `8c1f4e2a9b7d`        | `3729eae6a8c8`                                 | Require every disease prediction to target a location or a gorilla |
| `3729eae6a8c8`        | none                                           | Initial schema setup                                               |

### Commands

```bash
alembic upgrade head            # apply all pending migrations
alembic current                 # revision the database is on
alembic heads                   # must print ONE revision
alembic history --verbose       # full chain
alembic revision --autogenerate -m "add x"   # draft a migration from model changes
alembic downgrade -1            # undo the last migration (local only)
```

### Rules the team follows

- Review every autogenerated file. Autogenerate also picks up unrelated drift, and it misses tables that already exist.
- Write data-moving migrations by hand (enum to table, backfills, renames) so existing rows are kept.
- Create PostgreSQL enum types explicitly in `upgrade()` and drop them with `DROP TYPE IF EXISTS` in `downgrade()`.
- A branch that adds a migration sets its `down_revision` to the current head of develop. After merging develop, run `alembic heads`; two heads means the `down_revision` must be updated.
- If a table was created outside Alembic, run `alembic stamp <revision>` instead of creating it again.
- On Heroku, migrations run automatically: the `Procfile` release step (`release: alembic upgrade head`) applies them before each new version starts.

## 6. API reference

The tables below list every endpoint by area. The live, always-current version is Swagger at `/docs`, available locally; it is turned off in production (`ENVIRONMENT=production`). Who can call: A admin, D gorilla doctor, T gorilla tracker, Signed in = any active user, Public = no token needed.

### Authentication `/auth`

| Method | Path                    | Who                       | Purpose                                                                            |
| ------ | ----------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| POST   | `/auth/login`           | Public                    | Check email + password, email a 6-digit code. `app: "mobile"` rejects non-trackers |
| POST   | `/auth/verify-otp`      | Public                    | Exchange the code for an access token                                              |
| POST   | `/auth/forgot-password` | Public                    | Email a reset link (always returns 202, 60 s cooldown)                             |
| POST   | `/auth/invite-details`  | Public (link token)       | Show who an invite link belongs to                                                 |
| POST   | `/auth/set-password`    | Public (link token)       | Set password from an invite or reset link                                          |
| POST   | `/auth/invite-admin`    | X-Admin-Invite-Key header | Bootstrap the single administrator                                                 |

### Users `/users`

| Method | Path                                  | Who       | Purpose                                                     |
| ------ | ------------------------------------- | --------- | ----------------------------------------------------------- |
| GET    | `/users/me`                           | Signed in | Own profile (allowed even before the first password change) |
| PATCH  | `/users/me`                           | Signed in | Edit own name / phone                                       |
| PATCH  | `/users/me/password`                  | Signed in | Change own password                                         |
| POST   | `/users/`                             | A         | Invite a doctor or tracker (emails a set-password link)     |
| GET    | `/users/`                             | A         | List users, filter by role, `is_active`                     |
| GET    | `/users/{user_id}`                    | A         | One user                                                    |
| PATCH  | `/users/{user_id}`                    | A         | Edit a user (can't change own role)                         |
| PATCH  | `/users/{user_id}/status`             | A         | Activate / deactivate (removes device tokens)               |
| POST   | `/users/{user_id}/send-password-link` | A         | Reset someone's password by email                           |

### Gorillas `/gorillas` and groups `/gorilla-groups`

| Method | Path                         | Who       | Purpose                                                |
| ------ | ---------------------------- | --------- | ------------------------------------------------------ |
| POST   | `/gorillas/`                 | D         | Register a gorilla (name unique within its group)      |
| GET    | `/gorillas/`                 | D, T      | List, filter by `group_name`, `status`                 |
| GET    | `/gorillas/{gorilla_id}`     | D, T      | One gorilla                                            |
| PATCH  | `/gorillas/{gorilla_id}`     | D         | Edit (sex / age-category consistency checked)          |
| GET    | `/gorilla-groups/`           | Signed in | Active groups; `include_inactive=true` for all         |
| POST   | `/gorilla-groups/`           | A, D      | Add a group (name unique ignoring case)                |
| PATCH  | `/gorilla-groups/{group_id}` | A, D      | Rename or (de)activate; renames carry over to gorillas |

### Observations `/api/v1/observations`

| Method | Path                              | Who     | Purpose                                                 |
| ------ | --------------------------------- | ------- | ------------------------------------------------------- |
| POST   | `/api/v1/observations`            | T       | Log one sign (multipart form, optional photo)           |
| POST   | `/api/v1/observations/batch`      | T       | Log several signs from one sighting, sharing one photo  |
| GET    | `/api/v1/observations`            | A, D, T | Paged list with 13 filters; trackers only see their own |
| GET    | `/api/v1/observations/{id}`       | A, D, T | One observation, with its derived review status         |
| PATCH  | `/api/v1/observations/{id}`       | T       | Edit own observation while it is not linked to a case   |
| DELETE | `/api/v1/observations/{id}`       | T       | Delete own unlinked observation                         |
| GET    | `/api/v1/observations/{id}/image` | A, D, T | Photo bytes (no-store)                                  |
| PUT    | `/api/v1/observations/{id}/image` | T       | Replace the photo                                       |

### Health cases `/api/v1/health-cases`

| Method | Path                                                           | Who  | Purpose                                                                                     |
| ------ | -------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/health-cases`                                         | D    | Open a case (numbered C-YYYY-NNNN, assigned to an active doctor)                            |
| GET    | `/api/v1/health-cases`                                         | A, D | Case queue: filter by status, priority, gorilla, vet, group, dates, `open_only`, search `q` |
| GET    | `/api/v1/health-cases/{case_id}`                               | A, D | Case detail with observations, group pattern, cluster, environment, previous cases          |
| PATCH  | `/api/v1/health-cases/{case_id}`                               | D    | Edit clinical fields or reassign the vet                                                    |
| PATCH  | `/api/v1/health-cases/{case_id}/status`                        | D    | Move status (closing and reopening have their own endpoints)                                |
| POST   | `/api/v1/health-cases/{case_id}/close`                         | D    | Close with an outcome and a reason                                                          |
| POST   | `/api/v1/health-cases/{case_id}/reopen`                        | D    | Reopen a closed case                                                                        |
| POST   | `/api/v1/health-cases/{case_id}/observations/{observation_id}` | D    | Link an observation to the case                                                             |
| DELETE | `/api/v1/health-cases/{case_id}/observations/{observation_id}` | D    | Unlink it                                                                                   |

### Follow-up tasks `/api/v1/follow-up-tasks`

| Method | Path                                       | Who       | Purpose                                                                       |
| ------ | ------------------------------------------ | --------- | ----------------------------------------------------------------------------- |
| POST   | `/api/v1/follow-up-tasks`                  | D         | Create a task for an active tracker on an open case                           |
| GET    | `/api/v1/follow-up-tasks`                  | Signed in | List; trackers only see tasks assigned to them; filter by `case_id`, `status` |
| GET    | `/api/v1/follow-up-tasks/{task_id}`        | Signed in | One task (trackers: own only)                                                 |
| PATCH  | `/api/v1/follow-up-tasks/{task_id}/accept` | Assignee  | `issued` to `accepted`                                                        |
| PATCH  | `/api/v1/follow-up-tasks/{task_id}/submit` | Assignee  | To `completed`, with outcome text                                             |
| PATCH  | `/api/v1/follow-up-tasks/{task_id}/cancel` | D         | To `cancelled`, with a reason                                                 |

### Notifications `/api/v1/notifications`

| Method | Path                                    | Who             | Purpose                                                           |
| ------ | --------------------------------------- | --------------- | ----------------------------------------------------------------- |
| GET    | `/api/v1/notifications`                 | Signed in (own) | Inbox, newest first; `category`, `unread_only`, `limit`, `offset` |
| GET    | `/api/v1/notifications/unread-count`    | Signed in (own) | `{"count": n}` for the bell badge                                 |
| PATCH  | `/api/v1/notifications/read-all`        | Signed in (own) | Mark all (or one category) read                                   |
| PATCH  | `/api/v1/notifications/{id}/read`       | Signed in (own) | Mark one read                                                     |
| PUT    | `/api/v1/notifications/devices`         | Signed in       | Register an FCM token (after sign-in / token refresh)             |
| DELETE | `/api/v1/notifications/devices/{token}` | Signed in       | Remove a token (on sign-out)                                      |

### Locations, weather, AI

| Method               | Path                                           | Who               | Purpose                                                        |
| -------------------- | ---------------------------------------------- | ----------------- | -------------------------------------------------------------- |
| POST                 | `/api/v1/locations`                            | Public            | Get or create the grid cell containing a lat/long point        |
| GET                  | `/api/v1/locations`                            | Public            | Grid cells inside a bounding box (max 5 degrees span)          |
| GET                  | `/api/v1/locations/{grid_id}`                  | Public            | One grid cell                                                  |
| POST                 | `/api/v1/environmental-data`                   | A                 | Add a weather reading by hand                                  |
| GET                  | `/api/v1/environmental-data`                   | Signed in         | Paged readings, filter by grid and dates                       |
| POST                 | `/api/v1/environmental-data/collect`           | A                 | Pull past days from Open-Meteo for all or one grid cell        |
| GET                  | `/api/v1/environmental-data/trends`            | Signed in         | Recent vs. baseline weather for a grid cell or a group's cells |
| GET / PATCH / DELETE | `/api/v1/environmental-data/{id}`              | Signed in / A / A | One reading                                                    |
| GET                  | `/disease-predictions/`                        | Public            | Predictions, filter by gorilla, grid, risk level, disease      |
| GET                  | `/disease-predictions/{id}`                    | Public            | One prediction                                                 |
| GET                  | `/disease-predictions/{id}/observations`       | Public            | Observations behind a prediction                               |
| GET                  | `/disease-predictions/{id}/environmental-data` | Public            | Weather readings behind a prediction                           |
| GET                  | `/disease-predictions/risk-by-zone?days=N`     | Public            | Highest risk per grid cell for the map (days 1 to 90)          |
| POST                 | `/api/v1/ai/predictions`                       | D                 | Generate and save predictions with Gemini (201)                |
| POST                 | `/api/v1/ai/ask`                               | A, D              | Chatbot answer, not saved                                      |
| GET                  | `/preventive-recommendations/` and `/{id}`     | A, D              | Recommendations                                                |
| PATCH                | `/preventive-recommendations/{id}/review`      | D                 | Approve or reject                                              |
| CRUD                 | `/ai-reference-files/`                         | A                 | Reference documents for the AI                                 |
| CRUD                 | `/prediction-reference-links/`                 | A                 | Link predictions to reference files                            |

The AI endpoints are covered in detail in the AI section. Public rows are an open security gap (section 13).

## 7. Authentication and authorization

Every login takes two steps, a password and then an emailed 6-digit code, and every protected request carries a 30-minute Bearer JWT. Threat model and controls are in the Security section; this is how the backend implements them.

**Getting an account.** There is no self sign-up. The single admin is bootstrapped with `POST /auth/invite-admin` and the `ADMIN_INVITE_KEY` header. The admin then invites doctors and trackers with `POST /users/`. Each invite creates the user with an unusable password, `must_change_password = true`, and emails a set-password link.

**Link tokens.** Invite and reset links are JWTs of type `set_password` that carry a fingerprint of the current password hash. Setting a password changes the hash, so a link works only once and expires after `PASSWORD_LINK_EXPIRE_HOURS`.

`core/security.py`

```python
def password_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode()).hexdigest()[:32]


def create_password_link_token(user_id: uuid.UUID, password_hash: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": SET_PASSWORD,
        "pwf": password_fingerprint(password_hash),
        "iat": now,
        "exp": now + timedelta(hours=PASSWORD_LINK_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

**Login.**

- `POST /auth/login` checks the password with Argon2 (a dummy hash is checked when the email is unknown, so response time doesn't reveal accounts). Five failures lock the email for 15 minutes, and repeated failures from one IP address are blocked for 15 minutes. The counters are kept in Redis, so they survive restarts and are shared between dynos.
- A 6-digit code is stored in Redis as an HMAC under `canopy:login_otp:{user_id}` for 5 minutes, and emailed. If the email fails, the code is deleted and the API returns 502.
- `POST /auth/verify-otp` compares the code in constant time. Five wrong codes delete it. On success `last_login_at` is set and an access token is returned.

Requests send `Authorization: Bearer <token>`. `get_authenticated_user` rejects missing, invalid, expired or wrong-type tokens and inactive users (401). `get_current_user` also blocks accounts that still must change their password (403).

**Roles.** `require_roles(...)` returns 403 when the user's role is not allowed. Role checks are always done on the server; the clients only hide screens.

`core/dependencies.py`

```python
HEALTH_READERS = (UserRole.admin, UserRole.gorilla_doctor)


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise _unauthorized
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError):
        raise _unauthorized from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _unauthorized
    return user


def get_current_user(user: User = Depends(get_authenticated_user)) -> User:
    if user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password change required",
        )
    return user


def require_roles(*roles: UserRole):

    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return user

    return checker
```

"Health readers" in this documentation and the AI section means `HEALTH_READERS`: admins and gorilla doctors. This currently lets admins read health cases, which conflicts with the rule that admins see no clinical data (see section 13). Some routers still use a second helper, `services.auth_service.require_role` (G-08).

Some rules go beyond role:

- Trackers only see their own observations and their own follow-up tasks (other records return 404, not 403).
- Only the assigned tracker can accept or submit a task.
- Admins can read observations but not edit them.
- Each user only ever sees their own notifications.
- The mobile app sends `app: "mobile"` at login, and non-trackers are refused there.

Deactivating a user (`PATCH /users/{id}/status`) blocks all their requests at once and deletes their push device tokens.

## 8. Core workflows and business rules

The core loop is: a tracker logs an observation, a vet links it to a health case, the vet sends a follow-up task, the tracker submits the result, and the vet closes the case. Each step below lists the rules the backend enforces.

### 8.1 Observations

- A tracker logs one sign (`POST /observations`) or several signs from one sighting (`/batch`, one row per sign, all sharing the same photo, time and notes).
- The subject is either one gorilla (`gorilla_id`) or a whole group (`group_name`). If both are sent they must agree, and the group is always taken from the gorilla.
- `grid_id` must be an existing location.
- Flagging for the vet requires notes or a photo.
- Photos are checked by file signature (JPEG or PNG only, max 5 MB), stored in `observation_images` with a SHA-256 hash, and never returned in list responses.
- A tracker can edit, re-photo or delete their own observation only until it is linked to a case. After that it is locked (409) until a vet unlinks it.
- Each observation response includes a computed review status:
  - `pending_review`: not linked to a case yet.
  - `under_review`: linked to an open case.
  - `follow_up_required`: the case has an open task (the response includes the task).
  - `reviewed_no_follow_up`: the case is closed (the response includes the closure reason).

The status is worked out on every read from the linked case and its open tasks; it is never stored.

`services/observation_review.py`

```python
for observation in observations:
    case = cases.get(observation.case_id)
    if case is None:
        result[observation.observation_id] = PENDING
        continue
    task = open_tasks.get(case.case_id)
    if task is not None:
        status, message = ReviewStatus.follow_up_required, task.description
    elif case.status == CaseStatus.closed:
        status = ReviewStatus.reviewed_no_follow_up
        message = case.closure_reason or case.vet_notes
    else:
        status, message = ReviewStatus.under_review, None
    result[observation.observation_id] = ObservationReview(
        status=status,
        case_id=case.case_id,
        case_number=case.case_number,
        case_status=case.status,
        vet_name=names.get(case.user_id),
        message=message,
        follow_up_task_id=task.task_id if task else None,
    )
```

### 8.2 Health cases

- Only gorilla doctors open and change cases. The case is assigned to the opening doctor unless `user_id` names another active doctor.
- Case numbers are `C-<year>-<4 digits>`. If two cases are numbered at the same moment, the save is retried up to 5 times on a unique-key clash.
- An observation can be linked to at most one case. It must be about the same gorilla, or, for a group observation, the gorilla's group. Closed cases can't gain or lose observations.

`services/health_case_service.py`

```python
def link_observation(
    self, case_id: uuid.UUID, observation_id: uuid.UUID
) -> HealthCaseRead:
    case = self._get(case_id)
    observation = self.observations.get(observation_id)
    if observation is None:
        raise not_found("Observation not found")
    if case.status == CaseStatus.closed:
        raise conflict(CLOSED_CASE)
    if observation.case_id == case.case_id:
        raise conflict("This observation is already linked to this case.")
    if observation.case_id is not None:
        raise conflict("This observation is already linked to another case.")
    if observation.gorilla_id is None:
        group = case.gorilla.group_name
        if observation.group_name != group:
            raise bad_request(
                "This whole-group observation is about a different group "
                f"than the case (the gorilla belongs to the {group.value} group)."
            )
    elif observation.gorilla_id != case.gorilla_id:
        raise bad_request(
            "This observation is about a different gorilla than the case."
        )
    observation.case_id = case.case_id
    self.db.commit()
    return self.get(case_id)
```

- Status changes follow a fixed map. Closing and reopening use their own endpoints. Closing requires an outcome and a reason; reopening clears both.

| From              | Allowed next statuses                     |
| ----------------- | ----------------------------------------- |
| `new`             | `under_review`, `monitoring`              |
| `under_review`    | `monitoring`, `awaiting_result`, `closed` |
| `monitoring`      | `awaiting_result`, `closed`               |
| `awaiting_result` | `closed`, `reopened`                      |
| `closed`          | `reopened`                                |
| `reopened`        | `under_review`, `monitoring`, `closed`    |

The table mirrors this map in code, which is the source of truth:

`services/health_case_service.py`

```python
S = CaseStatus

TRANSITIONS: dict[CaseStatus, frozenset[CaseStatus]] = {
    S.new: frozenset({S.under_review, S.monitoring}),
    S.under_review: frozenset({S.monitoring, S.awaiting_result, S.closed}),
    S.monitoring: frozenset({S.awaiting_result, S.closed}),
    S.awaiting_result: frozenset({S.closed, S.reopened}),
    S.closed: frozenset({S.reopened}),
    S.reopened: frozenset({S.under_review, S.monitoring, S.closed}),
}


def check_transition(current: CaseStatus, target: CaseStatus) -> None:
    allowed = TRANSITIONS[current]
    if target not in allowed:
        options = ", ".join(sorted(s.value for s in allowed)) or "none"
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"A case cannot move from '{current.value}' to '{target.value}'. "
            f"Allowed next statuses: {options}.",
        )
```

The case detail response adds context computed when it is requested: other recent signs in the same group, a cluster of similar cases, weather around the last sighting, and the gorilla's previous cases with matching symptoms.

### 8.3 Follow-up tasks

- Only gorilla doctors create tasks. The assignee must be an active tracker. A `case_id`, if given, must exist and not be closed (400 otherwise).
- Status: `issued` to `accepted` to `completed`, or `cancelled` by the vet. Only the assignee can accept and submit; a wrong state returns 409.
- Submitting stores free-text outcome and `completed_at`. A task is reported `is_overdue` when it is still open after its `due_date`.
- Completing a task does not close the case. The vet decides the next step.

### 8.4 Notifications

Each notification row is saved in the same transaction as the event that caused it, so the inbox is never out of step with the data. Push is sent after the response, in the background.

| Event                                | Who is told                                      | Category                                   | Push |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------ | ---- |
| `task_assigned`                      | Tracker                                          | `update`                                   | Yes  |
| `task_due_today` (from 06:00 Kigali) | Tracker                                          | `alert`                                    | Yes  |
| `task_overdue` (once per task)       | Tracker and assigning vet                        | `alert`                                    | Yes  |
| `task_cancelled`                     | Tracker                                          | `update`                                   | Yes  |
| `task_submitted`                     | Tracker (receipt)                                | `update`                                   | No   |
| `task_completed`                     | Assigning vet                                    | `update`                                   | Yes  |
| `case_assigned` (to another vet)     | That vet                                         | `alert` if high or critical, else `update` | Yes  |
| `review_completed` (case closed)     | Trackers who reported on or followed up the case | `update`                                   | Yes  |

Push text is always generic (for example "You have a follow-up due today"). Case numbers, gorilla names and locations stay inside the signed-in apps. The push data carries only `notification_id` and `event_type`.

### 8.5 Gorillas and groups

- A gorilla name is unique within its group. Sex and age category must be consistent (`check_sex_and_age` in `schemas/gorilla.py`).
- Groups are stored in the `gorilla_groups` table (migration `4f2a9c71d8e3`), which replaced the old fixed enum. Admins and doctors can add, rename and deactivate groups without a deploy. A rename updates existing gorillas, and inactive groups can't receive new gorillas or observations.

## 9. Background jobs and integrations

One scheduled job and four outside services support the API. If an outside service is not configured, its feature returns 503 or is skipped, and the rest of the API keeps working.

**Scheduled job** `python -m jobs.notifications` (Heroku Scheduler, every 10 minutes). Every step is safe to run twice:

- Create missing "due today" and "overdue" reminders. A unique `dedupe_key` stops duplicates.
- Send pending pushes. Rows are claimed `pending` to `sending` so two runs never send the same one. Failures are retried up to 5 times, and rows stuck in `sending` for 10 minutes are released.
- Mark pushes older than 24 hours expired instead of sending them late.
- Delete notifications older than 90 days, except reminders for tasks that are still open.

Reminders are also synced lazily whenever a user opens their inbox, so they appear even if the scheduler is late. Pushes for normal events are sent right after the response with FastAPI `BackgroundTasks`.

| Integration              | File                                                | What it does                                                                                                                                   | Failure behaviour                                                      |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| SMTP email               | `integrations/email.py`                             | Invites, login codes, reset links; HTML + plain text, logo embedded                                                                            | 502 "could not be sent", nothing changed; 503 if SMTP vars are missing |
| Upstash Redis            | `core/redis_client.py`                              | Hashed login codes (5 min) and forgot-password cooldown (60 s)                                                                                 | 503 "Login is temporarily unavailable"                                 |
| Firebase Cloud Messaging | `integrations/push.py`, `services/push_delivery.py` | Generic push to Android, iOS and web tokens; dead tokens are removed                                                                           | Inbox still works; push marked failed / retried                        |
| Open-Meteo               | `integrations/open_meteo.py`                        | Daily mean temperature, total rainfall and mean humidity per grid cell, stored at 12:00 Kigali time; today is skipped because it is incomplete | Error returned to the admin who triggered `/collect`                   |

Weather is collected on demand (`POST /api/v1/environmental-data/collect`, admin). No daily schedule exists yet (REQ-070).

Disease predictions, preventive recommendations and AI reference files are stored and served by this backend, but how predictions are produced is covered in the AI section.

## 10. Errors and conventions

Errors always come back as FastAPI's JSON `{"detail": ...}`, with a plain-English message that clients can show directly. Validation errors (422) return `detail` as a list of `{loc, msg, type}`.

| Code      | Meaning in this API                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| 400       | Request is well-formed but breaks a rule (unknown gorilla, closed case, wrong status move)                   |
| 401       | No token, bad or expired token, wrong login code                                                             |
| 403       | Signed in but not allowed (role, password change pending, not the assignee)                                  |
| 404       | Not found, or exists but belongs to someone else (trackers can't probe others' records)                      |
| 409       | Conflict with current state (duplicate email/name, already linked, task in the wrong status, already closed) |
| 413 / 415 | Photo too large / not JPEG or PNG                                                                            |
| 422       | Schema validation failed, including unknown fields (all write schemas forbid extras)                         |
| 429       | Too many failed logins, or the per-user AI limit was reached (with a `Retry-After` header)                   |
| 502 / 503 | Email failed / Redis, SMTP or push not configured                                                            |

**IDs.** Every ID is a UUID string. Clients never send an ID for a new record.

**Times.** All timestamps are ISO 8601 and returned in UTC. Times sent without a zone are treated as UTC (`to_utc`). "Today" for reminders and weather uses `Africa/Kigali`.

**Pagination.** `limit` + `offset`, capped at 100 (`MAX_PAGE_SIZE`; the follow-up and location routers allow 200). Two response shapes exist today:

- `Page`: `{items, total, limit, offset}` for observations, health cases and environmental data.
- A bare JSON array for users, gorillas, follow-up tasks, notifications and predictions. Some of these use `skip` instead of `offset`.

**Updates.** PATCH bodies change only the fields sent. A required field can't be set to null (`PatchModel`). Blank strings in optional text become null.

`schemas/common.py`

```python
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PatchModel(StrictModel):
    nullable_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def _required_fields_cannot_be_cleared(self):
        cleared = sorted(
            name
            for name in self.model_fields_set
            if getattr(self, name) is None and name not in self.nullable_fields
        )
        if cleared:
            raise ValueError(f"{', '.join(cleared)} cannot be null")
        return self

    def changes(self) -> dict[str, Any]:
        return self.model_dump(exclude_unset=True)


class Page(BaseModel, Generic[ItemT]):
    items: list[ItemT]
    total: int
    limit: int
    offset: int
```

A service applies an update with `changes()`, so only the fields the client sent are written:

```python
def update(self, case_id: uuid.UUID, data: HealthCaseUpdate) -> HealthCaseRead:
    case = self._open_case(case_id)
    changes = data.changes()
    if "user_id" in changes:
        self._check_vet(changes["user_id"])
    for field, value in changes.items():
        setattr(case, field, value)
    self.repo.save(case)
    return self.get(case_id)
```

**Route prefixes.** Newer routers use `/api/v1/...`. Older ones (`/auth`, `/users`, `/gorillas`, `/gorilla-groups`, `/disease-predictions`, `/preventive-recommendations`, `/ai-reference-files`) have no prefix. Clients must use the exact paths in section 6.

## 11. Testing

The backend documentation describes a pytest suite in `tests/`, one file per area (for example `test_user.py`, `test_gorilla.py`, `test_observations.py`, `test_notifications.py`, `test_gorilla_group.py`, `test_alembic_env.py`). A documented CI snapshot on 26 October 2026 reports 783 passed, 16 skipped, 2 expected failures, and 84% line coverage. This historical result is not reproducible from this documentation-only repository.

**How the tests work**

- Each test gets a fresh in-memory SQLite database (`StaticPool`, foreign keys switched on) containing only the tables it needs.
- The app's `get_db` and `get_current_user` dependencies are overridden, so a test can act as an admin, doctor or tracker without logging in.
- `SECRET_KEY` is set with `os.environ.setdefault` before imports. `conftest.py` seeds shared data such as the gorilla groups.
- Tests check both allowed and refused paths: wrong role (403), other people's records (404), invalid states (409), bad input (400/422).
- Outside services (SMTP, Redis, FCM, Open-Meteo) are replaced with fakes; no test sends real email or pushes.

**Running them**

```bash
uv sync                        # install dependencies into .venv
uv run ruff check .            # lint
uv run ruff format --check .   # formatting
uv run pytest -q               # whole suite
uv run pytest tests/test_notifications.py -q   # one file
```

**Limits.** SQLite can't run PostGIS, so geometry queries in `locations` need a manual check against PostgreSQL. The team's test plan is in `Solene Test Cases.xlsx`; its execution status is tracked there.

## 12. Deployment and operations

The backend runs on Heroku and deploys automatically whenever `main` changes. All work reaches `main` only through reviewed pull requests.

**Branches.** `feature/<name>` to PR into `develop` to release PR `develop` to `main`. Dependent work is stacked: the second PR targets the first branch until that one merges, then is re-pointed at `develop`. PRs use the team template: summary, type of change, test steps, screenshots and the Jira ticket.

**Before opening a PR**

- `uv run ruff check .` and `uv run pytest -q` both pass.
- `alembic heads` prints one revision.
- No `.env`, key files (`*.json` service accounts) or local database files are staged.

**Releasing to Heroku**

1. Merge the release PR into `main`; Heroku builds and deploys.
2. Migrations run automatically through the `Procfile` release step. If it fails, Heroku keeps the previous version running; check `heroku logs`.
3. Make sure every new config var from section 3 is set (`heroku config`).
4. Check `GET /health` returns 200, and `/docs` returns 404 in production.

**Add-ons and scheduled work**

| Item                           | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| Heroku Postgres (with PostGIS) | Main database (`DATABASE_URL`)                      |
| Heroku Scheduler               | `python -m jobs.notifications` every 10 minutes     |
| Upstash Redis                  | Login codes and cooldowns                           |
| SMTP provider                  | Outgoing email                                      |
| Firebase project               | Push (`FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON`) |

**Request time limit.** Heroku's router ends any request that takes longer than 30 seconds (error H12). Slow calls, mainly the Gemini endpoints, can show the client a 503 while the backend keeps working and may still save the result.

**Secrets.** Secrets live only in Heroku config vars and local `.env` files, and are never pasted into chats, tickets or PRs. A key that has been exposed is deleted in its console (for example Google Cloud) and replaced, not just removed from git.

**Procfile.** Heroku runs migrations on every release, then starts the API:

```text
release: alembic upgrade head
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

The project requires Python 3.11 or newer (`requires-python = ">=3.11"` in `pyproject.toml`). See [Deployment](/deployment) for the full release process.

## 13. Known gaps and open decisions

Two backend gaps should be closed before release: unauthenticated prediction and location endpoints, and follow-up results that never reach the case. Status below is as of 26 Oct, based on the team gap register (`docs/solene-gap-register.md`).

| ID          | Gap                                                                                                                   | Priority | Status                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| G-01        | `/disease-predictions/*` endpoints need no login                                                                      | Critical | Open; release blocker until authorization is implemented and verified by tests                                                             |
| G-02        | `/api/v1/locations` (including POST) needs no login                                                                   | Critical | Open; release blocker until access policy is confirmed, implemented, and verified by tests                                                 |
| G-04        | No audit trail: reassignment, edits, close/reopen overwrite history                                                   | Critical | Partly fixed: `audit_logs` records updates and deletes (migration `b82f26b98e55`). Inserts are not logged and entries are not hash-chained |
| G-05        | Clinical fields are single text columns; a new treatment erases the old one                                           | Critical | Open, needs decision                                                                                                                       |
| G-07        | Trackers can hard-delete unlinked observations                                                                        | Critical | Open, needs decision                                                                                                                       |
| G-08        | Two role-check helpers (`core.dependencies.require_roles` and `services.auth_service.require_role`)                   | Medium   | Open                                                                                                                                       |
| G-11        | Follow-up submit stores only free text; no observation is linked to the case                                          | High     | Open                                                                                                                                       |
| G-12        | Task validation                                                                                                       | High     | Partly fixed: assignee and case now checked; a past `due_date` is still accepted                                                           |
| G-13        | No tracker-to-group assignment, so tasks can't be routed by group                                                     | High     | Open, needs decision                                                                                                                       |
| G-14        | Observation review is derived; a vet can't mark "reviewed, no case"                                                   | High     | Open, needs decision                                                                                                                       |
| G-15 / G-16 | No dedicated reassign endpoint or assignment history; any doctor can edit any case                                    | High     | Partly: reassignment now notifies the new vet                                                                                              |
| G-17        | A case can close while its follow-up tasks are open                                                                   | High     | Open, needs decision                                                                                                                       |
| G-21        | No idempotency key; a retried observation upload creates duplicates                                                   | High     | Open; offline sync is not duplicate-safe until server-side idempotency is implemented and tested                                           |
| G-25 / G-26 | Mixed route prefixes and list shapes (`Page` vs. bare array)                                                          | Medium   | Open                                                                                                                                       |
| G-27        | Questionable transitions (`awaiting_result` to `reopened`; no `new` to `closed`)                                      | Medium   | Open, needs decision                                                                                                                       |
| G-33        | Login lockout was in-process memory, lost on restart and not shared                                                   | Medium   | Resolved: lockouts moved to Redis (SOL-421)                                                                                                |
| G-06        | Migrations                                                                                                            |          | Resolved: Alembic in use. Still check the SQLite fallback and that no `.db` file is committed                                              |
| G-31        | Notifications backend                                                                                                 |          | Resolved: notifications merged (migration `f84d68e4c1fd`)                                                                                  |
| G-35        | No backend tests                                                                                                      |          | Resolved: 783 tests passing in CI                                                                                                          |
| New         | Photo rules disagree: the router says "JPEG, PNG or HEIC, max 10 MB" but the service accepts only JPEG/PNG up to 5 MB | Low      | Open                                                                                                                                       |
| New         | Opening a case for another vet saves the case, then its notification in a second commit                               | Low      | Open                                                                                                                                       |
| New         | Daily weather collection is manual only (REQ-070)                                                                     | Medium   | Open                                                                                                                                       |
| New         | `HEALTH_READERS` includes admin, so admins can read health cases and predictions, against the no-clinical-data rule   | High     | Open                                                                                                                                       |
| New         | Server rules for a backdated or future `observed_at` sent by offline sync are not documented                          | Medium   | Needs confirmation                                                                                                                         |
